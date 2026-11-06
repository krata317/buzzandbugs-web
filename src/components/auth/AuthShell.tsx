import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { ConnectionBanner } from '@/components/layout/ConnectionBanner';

interface AuthShellProps {
  title: string;
  description: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  backTo?: string;
  backLabel?: string;
}

export function AuthShell({
  title,
  description,
  children,
  footer,
  backTo = '/buzz',
  backLabel = 'Back to Buzz',
}: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <ConnectionBanner />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-10 sm:py-16">
        <div className="flex items-center justify-between">
          <Logo />
          <Link
            to={backTo}
            className="focus-ring inline-flex items-center gap-1.5 rounded-md text-[12.5px] text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft size={13} aria-hidden="true" />
            {backLabel}
          </Link>
        </div>

        <div className="mt-10">
          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-ink">
            {title}
          </h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{description}</p>
        </div>

        <div className="card mt-6 p-5 sm:p-6">{children}</div>

        {footer ? <div className="mt-5 text-center text-[13px] text-muted">{footer}</div> : null}
      </div>
    </div>
  );
}

export function OtpInput({
  value,
  onChange,
  invalid,
  id = 'otp',
}: {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  id?: string;
}) {
  return (
    <input
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value.replace(/\D/g, '').slice(0, 6))}
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern="\d{6}"
      maxLength={6}
      placeholder="000000"
      aria-label="Six-digit verification code"
      aria-invalid={invalid || undefined}
      className="field h-14 text-center font-mono text-[22px] tracking-[0.42em] placeholder:text-lineStrong"
    />
  );
}

export function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-5 flex items-center gap-1.5" aria-label={`Step ${step} of ${total}`}>
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          className={
            index + 1 <= step
              ? 'h-1 flex-1 rounded-full bg-accent transition-colors duration-300'
              : 'h-1 flex-1 rounded-full bg-line transition-colors duration-300'
          }
        />
      ))}
    </div>
  );
}
