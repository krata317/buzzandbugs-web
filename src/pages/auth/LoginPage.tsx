import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { errorMessage, isApiError } from '@/lib/api';
import { queryKeys } from '@/features/queryKeys';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/form';
import { InlineError } from '@/components/ui/feedback';

export function LoginPage() {
  useDocumentTitle('Sign in');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const state = location.state as { from?: string } | null;
  const requestedFrom = state?.from;
  const from = requestedFrom && requestedFrom.startsWith('/') ? requestedFrom : '/buzz';

  if (isAuthenticated) return <Navigate to={from} replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Enter your username or email and your password.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await authApi.login(identifier.trim(), password);
      await queryClient.invalidateQueries({ queryKey: queryKeys.me });
      toast.push({ title: 'Signed in', tone: 'success' });
      navigate(from, { replace: true });
    } catch (loginError) {
      if (isApiError(loginError) && loginError.status === 429) {
        setError(loginError.message);
      } else if (isApiError(loginError) && loginError.status === 401) {
        setError('That username/email and password combination is not correct.');
      } else {
        setError(errorMessage(loginError));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Sign in"
      description="Use your username or email address. Sessions last 90 days."
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-medium text-accent underline underline-offset-2">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Username or email" htmlFor="identifier">
          <Input
            id="identifier"
            value={identifier}
            onChange={(event) => {
              setIdentifier(event.target.value);
              setError(null);
            }}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="ada or ada@example.com"
            invalid={Boolean(error)}
          />
        </Field>

        <Field label="Password" htmlFor="password">
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError(null);
            }}
            autoComplete="current-password"
            placeholder="••••••••"
            invalid={Boolean(error)}
          />
        </Field>

        {error ? <InlineError>{error}</InlineError> : null}

        <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting}>
          Sign in
        </Button>

        <div className="text-center">
          <Link
            to="/forgot-password"
            className="text-[12.5px] text-muted underline decoration-line underline-offset-2 transition-colors hover:text-ink"
          >
            Forgot your password?
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
