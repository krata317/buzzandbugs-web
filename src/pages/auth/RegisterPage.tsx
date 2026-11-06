import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { authApi, errorMessage } from '@/lib/api';
import { queryKeys } from '@/features/queryKeys';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  validateDisplayName,
  validateEmail,
  validateOtp,
  validatePassword,
  validateUsername,
  passwordStrength,
} from '@/lib/validation';
import { AuthShell, OtpInput, StepDots } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/form';
import { InlineError } from '@/components/ui/feedback';
import { cn } from '@/lib/cn';

type Step = 'email' | 'code' | 'account';

const STEP_NUMBER: Record<Step, number> = { email: 1, code: 2, account: 3 };

export function RegisterPage() {
  useDocumentTitle('Create an account');
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [registrationToken, setRegistrationToken] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  if (isAuthenticated) return <Navigate to="/buzz" replace />;

  const requestCode = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await authApi.requestRegistrationOtp(email.trim());
      setStep('code');
      setCooldown(30);
      toast.push({
        title: 'Code sent',
        description: 'Check the inbox for that address. The code expires in 10 minutes.',
        tone: 'success',
      });
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async () => {
    const codeError = validateOtp(code);
    if (codeError) {
      setError(codeError);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const result = await authApi.verifyRegistrationOtp(email.trim(), code.trim());
      setRegistrationToken(result.registrationToken);
      setStep('account');
    } catch (verifyError) {
      setError(errorMessage(verifyError));
    } finally {
      setBusy(false);
    }
  };

  const createAccount = async (event: FormEvent) => {
    event.preventDefault();
    const usernameError = validateUsername(username);
    if (usernameError) {
      setError(usernameError);
      return;
    }
    const displayError = validateDisplayName(displayName);
    if (displayError) {
      setError(displayError);
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await authApi.completeRegistration({
        registrationToken,
        username: username.trim(),
        displayName: displayName.trim(),
        password,
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.me });
      toast.push({ title: 'Welcome to Buzz and Bugs', tone: 'success' });
      navigate('/buzz', { replace: true });
    } catch (createError) {
      setError(errorMessage(createError));
    } finally {
      setBusy(false);
    }
  };

  const strength = passwordStrength(password);

  return (
    <AuthShell
      title="Create an account"
      description="Email verification first, then pick a username. Usernames are permanent."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent underline underline-offset-2">
            Sign in
          </Link>
        </>
      }
    >
      <StepDots step={STEP_NUMBER[step]} total={3} />

      {step === 'email' ? (
        <form
          className="space-y-4"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void requestCode();
          }}
        >
          <Field
            label="Email address"
            htmlFor="register-email"
            hint="We send a six-digit code. Nothing is delivered if the address already has an account."
          >
            <Input
              id="register-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError(null);
              }}
              autoComplete="email"
              autoCapitalize="none"
              placeholder="you@example.com"
              invalid={Boolean(error)}
            />
          </Field>

          {error ? <InlineError>{error}</InlineError> : null}

          <Button type="submit" variant="primary" size="lg" fullWidth loading={busy}>
            Send code
          </Button>
        </form>
      ) : null}

      {step === 'code' ? (
        <form
          className="space-y-4"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void verifyCode();
          }}
        >
          <p className="text-[13px] leading-relaxed text-muted">
            Enter the code sent to <span className="font-medium text-ink">{email}</span>.
          </p>

          <Field label="Six-digit code" htmlFor="register-code">
            <OtpInput id="register-code" value={code} onChange={(value) => {
              setCode(value);
              setError(null);
            }} invalid={Boolean(error)} />
          </Field>

          {error ? <InlineError>{error}</InlineError> : null}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={busy}
            disabled={code.length !== 6}
          >
            Verify code
          </Button>

          <div className="flex items-center justify-between text-[12.5px]">
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setError(null);
              }}
              className="focus-ring text-muted underline underline-offset-2 hover:text-ink"
            >
              Change email
            </button>
            <button
              type="button"
              disabled={cooldown > 0 || busy}
              onClick={() => void requestCode()}
              className="focus-ring text-muted underline underline-offset-2 hover:text-ink disabled:opacity-50"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            </button>
          </div>
        </form>
      ) : null}

      {step === 'account' ? (
        <form className="space-y-4" onSubmit={createAccount} noValidate>
          <Field
            label="Username"
            htmlFor="register-username"
            hint="3–20 characters. Letters, numbers and underscores. This cannot be changed."
          >
            <Input
              id="register-username"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setError(null);
              }}
              autoCapitalize="none"
              spellCheck={false}
              placeholder="ada_lovelace"
              invalid={Boolean(error)}
            />
          </Field>

          <Field label="Display name" htmlFor="register-display">
            <Input
              id="register-display"
              value={displayName}
              onChange={(event) => {
                setDisplayName(event.target.value);
                setError(null);
              }}
              placeholder="Ada Lovelace"
              maxLength={50}
              invalid={Boolean(error)}
            />
          </Field>

          <Field label="Password" htmlFor="register-password" hint="At least 8 characters.">
            <Input
              id="register-password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError(null);
              }}
              autoComplete="new-password"
              placeholder="••••••••"
              invalid={Boolean(error)}
            />
          </Field>

          {password ? (
            <div className="flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {[1, 2, 3, 4].map((index) => (
                  <span
                    key={index}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-colors duration-200',
                      strength.score >= index ? 'bg-accent' : 'bg-line',
                    )}
                  />
                ))}
              </div>
              <span className="w-16 text-right font-mono text-[10px] uppercase tracking-[0.08em] text-subtle">
                {strength.label}
              </span>
            </div>
          ) : null}

          {error ? <InlineError>{error}</InlineError> : null}

          <Button type="submit" variant="primary" size="lg" fullWidth loading={busy}>
            Create account
          </Button>
        </form>
      ) : null}
    </AuthShell>
  );
}
