import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, LogOut, Trash2, UserX } from 'lucide-react';
import { authApi, errorMessage, isApiError } from '@/lib/api';
import { queryKeys } from '@/features/queryKeys';
import { useAuth } from '@/providers/AuthProvider';
import { useBlockedUsers, useBlock } from '@/features/users/queries';
import { validatePassword } from '@/lib/validation';
import { useToast } from '@/providers/ToastProvider';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/form';
import { InlineError, Skeleton } from '@/components/ui/feedback';
import { SettingsCard } from './SettingsLayout';

export function AccountSettings() {
  const { me, signOut } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const toast = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [needsRevocationConfirm, setNeedsRevocationConfirm] = useState(false);

  const [deleteStep, setDeleteStep] = useState<'idle' | 'code'>('idle');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteCode, setDeleteCode] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const blocked = useBlockedUsers();
  const block = useBlock();

  const changePassword = useMutation({
    mutationFn: (confirm: boolean) =>
      authApi.changePassword({
        currentPassword,
        newPassword,
        confirmSessionRevocation: confirm,
      }),
  });

  const requestDeletion = useMutation({ mutationFn: authApi.requestAccountDeletion });
  const confirmDeletion = useMutation({ mutationFn: authApi.confirmAccountDeletion });

  const submitPassword = (confirmRevocation: boolean) => {
    if (!currentPassword) {
      setPasswordError('Enter your current password.');
      return;
    }
    const policyError = validatePassword(newPassword);
    if (policyError) {
      setPasswordError(policyError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('The new passwords do not match.');
      return;
    }

    setPasswordError(null);
    changePassword.mutate(confirmRevocation, {
      onSuccess: () => {
        toast.push({
          title: 'Password changed',
          description: 'Every session was signed out. Sign in again with the new password.',
          tone: 'success',
        });
        queryClient.setQueryData(queryKeys.me, null);
        navigate('/login', { replace: true });
      },
      onError: (error) => {
        if (isApiError(error) && error.status === 400) {
          const details = error.details as
            | { requiresConfirmation?: boolean; activeSessions?: number }
            | undefined;
          if (details?.requiresConfirmation) {
            setNeedsRevocationConfirm(true);
            return;
          }
        }
        setPasswordError(errorMessage(error));
      },
    });
  };

  return (
    <div className="space-y-4">
      <SettingsCard
        title="Password"
        description="Changing your password signs out every active session, including this one."
      >
        <div className="space-y-3.5">
          <Field label="Current password" htmlFor="current-password">
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              autoComplete="current-password"
              onChange={(event) => {
                setCurrentPassword(event.target.value);
                setPasswordError(null);
              }}
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="New password" htmlFor="new-password" hint="At least 8 characters.">
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                autoComplete="new-password"
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  setPasswordError(null);
                }}
              />
            </Field>
            <Field label="Confirm new password" htmlFor="confirm-password">
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                autoComplete="new-password"
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setPasswordError(null);
                }}
              />
            </Field>
          </div>

          {needsRevocationConfirm ? (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-[12.5px] leading-relaxed text-amber-800 dark:text-amber-200">
              This will sign you out of all sessions. Press confirm to continue.
            </div>
          ) : null}

          {passwordError ? <InlineError>{passwordError}</InlineError> : null}

          <div className="flex justify-end">
            <Button
              variant={needsRevocationConfirm ? 'danger' : 'primary'}
              size="sm"
              iconLeft={<KeyRound size={13} />}
              loading={changePassword.isPending}
              onClick={() => submitPassword(needsRevocationConfirm)}
            >
              {needsRevocationConfirm ? 'Confirm and change password' : 'Change password'}
            </Button>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Blocked accounts"
        description="Blocked accounts cannot see your profile or posts, and you cannot see theirs."
      >
        {blocked.isLoading ? <Skeleton className="h-12 w-full" /> : null}

        {blocked.data && blocked.data.length === 0 ? (
          <p className="flex items-center gap-2 text-[12.5px] text-muted">
            <UserX size={14} aria-hidden="true" />
            You have not blocked anyone.
          </p>
        ) : null}

        {blocked.data && blocked.data.length > 0 ? (
          <ul className="divide-y divide-line">
            {blocked.data.map((entry) => (
              <li key={entry.id ?? entry.username} className="flex items-center gap-3 py-2.5">
                <Avatar src={entry.avatarUrl} name={entry.displayName} size="sm" />
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/users/${entry.username}`}
                    className="focus-ring block truncate text-[13px] font-medium text-ink hover:text-accent"
                  >
                    {entry.displayName}
                  </Link>
                  {entry.username ? (
                    <p className="truncate font-mono text-[10.5px] text-subtle">@{entry.username}</p>
                  ) : null}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  loading={block.isPending && block.variables?.username === entry.username}
                  onClick={() => {
                    if (!entry.username) return;
                    block.mutate(
                      { username: entry.username, block: false },
                      {
                        onSuccess: () =>
                          toast.push({ title: 'Account unblocked', tone: 'success' }),
                        onError: (error) =>
                          toast.push({
                            title: 'Could not unblock the account',
                            description: errorMessage(error),
                            tone: 'error',
                          }),
                      },
                    );
                  }}
                >
                  Unblock
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
      </SettingsCard>

      <SettingsCard title="Session" description="Sign out of this browser.">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[12.5px] text-muted">
            Signed in as <span className="font-medium text-ink">{me?.user.email}</span>
          </p>
          <Button
            variant="secondary"
            size="sm"
            iconLeft={<LogOut size={13} />}
            onClick={() => {
              navigate('/', { replace: true });
              void signOut();
            }}
          >
            Sign out
          </Button>
        </div>
      </SettingsCard>

      <SettingsCard
        tone="danger"
        title="Delete account"
        description="Deletion starts a seven-day recovery window. After that, posts are anonymised as Squashed Bug and personal data is removed."
      >
        {deleteStep === 'idle' ? (
          <div className="space-y-3">
            <Field
              label="Confirm with your password"
              htmlFor="delete-password"
              hint="A verification code is sent to your email as a second step."
            >
              <Input
                id="delete-password"
                type="password"
                value={deletePassword}
                autoComplete="current-password"
                onChange={(event) => {
                  setDeletePassword(event.target.value);
                  setDeleteError(null);
                }}
              />
            </Field>

            {deleteError ? <InlineError>{deleteError}</InlineError> : null}

            <div className="flex justify-end">
              <Button
                variant="danger"
                size="sm"
                iconLeft={<Trash2 size={13} />}
                loading={requestDeletion.isPending}
                disabled={!deletePassword}
                onClick={() =>
                  requestDeletion.mutate(deletePassword, {
                    onSuccess: () => {
                      setDeleteStep('code');
                      setDeleteError(null);
                      toast.push({
                        title: 'Verification code sent',
                        description: 'Enter it below to schedule the deletion.',
                        tone: 'info',
                      });
                    },
                    onError: (error) => setDeleteError(errorMessage(error)),
                  })
                }
              >
                Send verification code
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[12.5px] leading-relaxed text-muted">
              Enter the six-digit code sent to your email. Confirming signs you out immediately;
              you can sign back in and cancel until the deletion date.
            </p>

            <Field label="Verification code" htmlFor="delete-code">
              <Input
                id="delete-code"
                value={deleteCode}
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                className="font-mono tracking-[0.3em]"
                onChange={(event) => {
                  setDeleteCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                  setDeleteError(null);
                }}
              />
            </Field>

            {deleteError ? <InlineError>{deleteError}</InlineError> : null}

            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDeleteStep('idle');
                  setDeleteCode('');
                  setDeleteError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={confirmDeletion.isPending}
                disabled={deleteCode.length !== 6}
                onClick={() =>
                  confirmDeletion.mutate(deleteCode, {
                    onSuccess: () => {
                      queryClient.setQueryData(queryKeys.me, null);
                      toast.push({
                        title: 'Deletion scheduled',
                        description: 'Sign in again within seven days to cancel it.',
                        tone: 'info',
                      });
                      navigate('/login', { replace: true });
                    },
                    onError: (error) => setDeleteError(errorMessage(error)),
                  })
                }
              >
                Schedule deletion
              </Button>
            </div>
          </div>
        )}
      </SettingsCard>
    </div>
  );
}
