import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { adminApi, errorMessage } from '@/lib/api';
import { queryKeys } from '@/features/queryKeys';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/form';
import { InlineError } from '@/components/ui/feedback';
import { ConnectionBanner } from '@/components/layout/ConnectionBanner';
import { useAdminMe } from '@/features/admin/queries';

export function AdminLoginPage() {
  useDocumentTitle('Admin sign in');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const me = useAdminMe();

  if (me.data) return <Navigate to="/admin" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!username.trim() || !password) {
      setError('Enter the admin username and password.');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await adminApi.login(username.trim(), password);
      await queryClient.invalidateQueries({ queryKey: queryKeys.adminMe });
      navigate('/admin', { replace: true });
    } catch (loginError) {
      setError(errorMessage(loginError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <ConnectionBanner />
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-12">
        <Logo />

        <div className="mt-10 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-raised px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted">
            <ShieldCheck size={10} aria-hidden="true" />
            Operator access
          </span>
        </div>

        <h1 className="mt-3 text-[24px] font-semibold tracking-[-0.02em] text-ink">Admin sign in</h1>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
          A separate identity from user accounts. Sessions last twelve hours.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          <Field label="Username" htmlFor="admin-username">
            <Input
              id="admin-username"
              value={username}
              autoComplete="username"
              autoCapitalize="none"
              onChange={(event) => {
                setUsername(event.target.value);
                setError(null);
              }}
              invalid={Boolean(error)}
            />
          </Field>

          <Field label="Password" htmlFor="admin-password">
            <Input
              id="admin-password"
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(event) => {
                setPassword(event.target.value);
                setError(null);
              }}
              invalid={Boolean(error)}
            />
          </Field>

          {error ? <InlineError>{error}</InlineError> : null}

          <Button type="submit" variant="primary" size="lg" fullWidth loading={busy}>
            Sign in
          </Button>
        </form>

        <p className="mt-5 text-[11.5px] leading-relaxed text-subtle">
          Create the first admin from the backend with{' '}
          <code className="font-mono">npm run admin:create</code>. There is no public route for
          creating one.
        </p>
      </div>
    </div>
  );
}
