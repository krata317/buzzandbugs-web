import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi, errorMessage } from '@/lib/api';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/providers/ToastProvider';
import { validateEmail, validateOtp, validatePassword } from '@/lib/validation';
import { AuthShell, OtpInput, StepDots } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/form';
import { InlineError } from '@/components/ui/feedback';

type Step = 'email' | 'code' | 'password';

const STEP_NUMBER: Record<Step, number> = { email: 1, code: 2, password: 3 };

export function ForgotPasswordPage() {
  useDocumentTitle('Reset your password');
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const requestCode = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await authApi.requestPasswordReset(email.trim());
      setStep('code');
      setCooldown(30);
      toast.push({
        title: 'If that address exists, a code is on its way',
        description: 'The code expires in 10 minutes.',
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
      const result = await authApi.verifyPasswordReset(email.trim(), code.trim());
      setResetToken(result.resetToken);
      setStep('password');
    } catch (verifyError) {
      setError(errorMessage(verifyError));
    } finally {
      setBusy(false);
    }
  };

  const setNewPassword = async (event: FormEvent) => {
    event.preventDefault();
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await authApi.completePasswordReset(resetToken, password);
      toast.push({
        title: 'Password updated',
        description: 'Every existing session was signed out. Sign in with the new password.',
        tone: 'success',
      });
      navigate('/login', { replace: true });
    } catch (resetError) {
      setError(errorMessage(resetError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      description="We verify by email code, then you choose a new password."
      backTo="/login"
      backLabel="Back to sign in"
      footer={
        <>
          Remembered it?{' '}
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
          <Field label="Email address" htmlFor="reset-email">
            <Input
              id="reset-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError(null);
              }}
              autoComplete="email"
              placeholder="you@example.com"
              invalid={Boolean(error)}
            />
          </Field>

          {error ? <InlineError>{error}</InlineError> : null}

          <Button type="submit" variant="primary" size="lg" fullWidth loading={busy}>
            Send reset code
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

          <Field label="Six-digit code" htmlFor="reset-code">
            <OtpInput
              id="reset-code"
              value={code}
              onChange={(value) => {
                setCode(value);
                setError(null);
              }}
              invalid={Boolean(error)}
            />
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

      {step === 'password' ? (
        <form className="space-y-4" onSubmit={setNewPassword} noValidate>
          <Field
            label="New password"
            htmlFor="reset-password"
            hint="At least 8 characters. All sessions will be signed out."
          >
            <Input
              id="reset-password"
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

          {error ? <InlineError>{error}</InlineError> : null}

          <Button type="submit" variant="primary" size="lg" fullWidth loading={busy}>
            Set new password
          </Button>
        </form>
      ) : null}
    </AuthShell>
  );
}
