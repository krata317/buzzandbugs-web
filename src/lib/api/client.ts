import type { ApiErrorBody } from './types';

const DEFAULT_BASE_URL = 'http://localhost:4000/api/v1';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? DEFAULT_BASE_URL).replace(
  /\/+$/,
  '',
);

export const UNAUTHORIZED_EVENT = 'bnb:unauthorized';

export type AuthScope = 'user' | 'admin' | 'none';

/** A response the backend produced. Carries the backend's own error code. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isRateLimited(): boolean {
    return this.status === 429;
  }
}

/** The request never reached the server, or the connection dropped. */
export class NetworkError extends Error {
  constructor(message = 'We could not reach Buzz and Bugs. Check your connection and try again.') {
    super(message);
    this.name = 'NetworkError';
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

export function errorMessage(error: unknown): string {
  if (isApiError(error) || isNetworkError(error)) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong.';
}

const UNSAFE_METHODS = new Set(['POST', 'PATCH', 'DELETE']);

const CSRF_COOKIE: Record<Exclude<AuthScope, 'none'>, string> = {
  user: 'bnb_csrf',
  admin: 'bnb_admin_csrf',
};

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function statusFallback(status: number): string {
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return 'You are not allowed to perform this action.';
  if (status === 404) return 'That resource could not be found.';
  if (status === 413) return 'That file is too large.';
  if (status === 429) return 'Too many requests. Please slow down and try again.';
  if (status >= 500) return 'The server could not complete the request.';
  return 'The request could not be completed.';
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  scope?: AuthScope;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? 'GET';
  const scope = options.scope ?? 'user';
  const url = new URL(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`);

  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value === undefined || value === null || value === '') continue;
      url.searchParams.set(key, String(value));
    }
  }

  const headers: Record<string, string> = { accept: 'application/json' };
  if (options.body !== undefined) headers['content-type'] = 'application/json';

  if (UNSAFE_METHODS.has(method) && scope !== 'none') {
    const token = readCookie(CSRF_COOKIE[scope]);
    if (token) headers['x-csrf-token'] = token;
  }

  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 20_000;
  let timedOut = false;
  const timer = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const forwardAbort = () => controller.abort();
  options.signal?.addEventListener('abort', forwardAbort);

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      credentials: 'include',
      mode: 'cors',
      signal: controller.signal,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    if (timedOut) {
      throw new NetworkError('That took too long. Check your connection and try again.');
    }
    throw new NetworkError();
  } finally {
    window.clearTimeout(timer);
    options.signal?.removeEventListener('abort', forwardAbort);
  }

  const text = await response.text().catch(() => '');
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const body = payload as ApiErrorBody | null;
    const code = body?.error?.code ?? `HTTP_${response.status}`;
    const message = body?.error?.message ?? statusFallback(response.status);

    if (response.status === 401 && scope !== 'none') {
      window.dispatchEvent(
        new CustomEvent(UNAUTHORIZED_EVENT, { detail: { scope, path } }),
      );
    }

    throw new ApiError(response.status, code, message, body?.error?.details);
  }

  return payload as T;
}

/** Multipart upload. The browser must set the multipart boundary itself. */
export async function requestForm<T>(
  path: string,
  form: FormData,
  options: { scope?: AuthScope; signal?: AbortSignal } = {},
): Promise<T> {
  const scope = options.scope ?? 'user';
  const headers: Record<string, string> = { accept: 'application/json' };
  if (scope !== 'none') {
    const token = readCookie(CSRF_COOKIE[scope]);
    if (token) headers['x-csrf-token'] = token;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers,
      credentials: 'include',
      mode: 'cors',
      body: form,
      signal: options.signal,
    });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new NetworkError();
  }

  const text = await response.text().catch(() => '');
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const body = payload as ApiErrorBody | null;
    if (response.status === 401) {
      window.dispatchEvent(
        new CustomEvent(UNAUTHORIZED_EVENT, { detail: { scope, path } }),
      );
    }
    throw new ApiError(
      response.status,
      body?.error?.code ?? `HTTP_${response.status}`,
      body?.error?.message ?? statusFallback(response.status),
      body?.error?.details,
    );
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string, options: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    request<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
