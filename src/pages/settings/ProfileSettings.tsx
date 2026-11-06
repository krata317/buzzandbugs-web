import { useEffect, useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import type { SocialKey } from '@/lib/api/types';
import { useAuth } from '@/providers/AuthProvider';
import { useUpdateProfile, useUploadAvatar } from '@/features/users/queries';
import { errorMessage } from '@/lib/api';
import { validateDisplayName, validateSocialUrl } from '@/lib/validation';
import { useToast } from '@/providers/ToastProvider';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/form';
import { InlineError } from '@/components/ui/feedback';
import { SettingsCard } from './SettingsLayout';

const SOCIAL_FIELDS: Array<{ key: SocialKey; label: string; placeholder: string }> = [
  { key: 'github', label: 'GitHub', placeholder: 'https://github.com/username' },
  { key: 'x', label: 'X', placeholder: 'https://x.com/username' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@channel' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
  { key: 'website', label: 'Website', placeholder: 'https://example.com' },
];

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export function ProfileSettings() {
  const { user, me } = useAuth();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [about, setAbout] = useState(user?.about ?? '');
  const [links, setLinks] = useState<Record<SocialKey, string>>({
    github: '',
    x: '',
    linkedin: '',
    youtube: '',
    instagram: '',
    website: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName);
    setAbout(user.about ?? '');
    setLinks({
      github: user.socialLinks?.github ?? '',
      x: user.socialLinks?.x ?? '',
      linkedin: user.socialLinks?.linkedin ?? '',
      youtube: user.socialLinks?.youtube ?? '',
      instagram: user.socialLinks?.instagram ?? '',
      website: user.socialLinks?.website ?? '',
    });
  }, [user]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onPickAvatar = (file: File | undefined) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Avatars must be a JPEG, PNG or WebP image.');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError('Avatars must be at most 2 MB.');
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file));
    uploadAvatar.mutate(file, {
      onSuccess: () => toast.push({ title: 'Profile picture updated', tone: 'success' }),
      onError: (uploadError) => {
        setPreview(null);
        setError(errorMessage(uploadError));
      },
    });
  };

  const save = () => {
    const nameError = validateDisplayName(displayName);
    if (nameError) {
      setError(nameError);
      return;
    }

    for (const field of SOCIAL_FIELDS) {
      const linkError = validateSocialUrl(links[field.key]);
      if (linkError) {
        setError(`${field.label}: ${linkError}`);
        return;
      }
    }

    setError(null);

    const socialLinks: Partial<Record<SocialKey, string | null>> = {};
    for (const field of SOCIAL_FIELDS) {
      const value = links[field.key].trim();
      socialLinks[field.key] = value ? value : null;
    }

    updateProfile.mutate(
      {
        displayName: displayName.trim(),
        about: about.trim() ? about.trim() : null,
        socialLinks: socialLinks as Record<SocialKey, string>,
      },
      {
        onSuccess: () => toast.push({ title: 'Profile saved', tone: 'success' }),
        onError: (saveError) => setError(errorMessage(saveError)),
      },
    );
  };

  const avatarSrc = preview ?? user?.avatarUrl ?? null;

  return (
    <div className="space-y-4">
      <SettingsCard
        title="Profile picture"
        description="JPEG, PNG or WebP, up to 2 MB. Images are re-encoded and stripped of metadata for privacy."
      >
        <div className="flex flex-wrap items-center gap-4">
          <Avatar src={avatarSrc} name={displayName || 'You'} size="xl" ring />
          <div className="flex flex-col gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => onPickAvatar(event.target.files?.[0])}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploadAvatar.isPending}
              iconLeft={
                uploadAvatar.isPending ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Camera size={13} />
                )
              }
            >
              {uploadAvatar.isPending ? 'Uploading…' : 'Change picture'}
            </Button>
            <p className="text-[11.5px] text-subtle">Square images work best.</p>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Public profile"
        description="Shown on your profile page. Visibility of each part is controlled in Privacy."
        footer={
          <Button variant="primary" size="sm" onClick={save} loading={updateProfile.isPending}>
            Save profile
          </Button>
        }
      >
        <div className="space-y-4">
          <Field
            label="Username"
            htmlFor="settings-username"
            hint="Usernames cannot be changed after registration."
          >
            <Input id="settings-username" value={user?.username ?? ''} readOnly disabled />
          </Field>

          <Field
            label="Display name"
            htmlFor="settings-display-name"
            hint={`${displayName.length}/50`}
          >
            <Input
              id="settings-display-name"
              value={displayName}
              maxLength={50}
              onChange={(event) => {
                setDisplayName(event.target.value);
                setError(null);
              }}
            />
          </Field>

          <Field
            label="About"
            htmlFor="settings-about"
            optional
            hint={`${about.length}/2000 · plain text, line breaks are preserved`}
          >
            <Textarea
              id="settings-about"
              value={about}
              maxLength={2000}
              rows={4}
              placeholder="What you work on, what you are learning, what you want to build."
              onChange={(event) => {
                setAbout(event.target.value);
                setError(null);
              }}
            />
          </Field>

          <fieldset>
            <legend className="label">Links</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {SOCIAL_FIELDS.map((field) => (
                <div key={field.key}>
                  <label
                    htmlFor={`social-${field.key}`}
                    className="mb-1 block font-mono text-[10px] uppercase tracking-[0.08em] text-subtle"
                  >
                    {field.label}
                  </label>
                  <Input
                    id={`social-${field.key}`}
                    value={links[field.key]}
                    placeholder={field.placeholder}
                    inputMode="url"
                    onChange={(event) => {
                      setLinks((current) => ({ ...current, [field.key]: event.target.value }));
                      setError(null);
                    }}
                  />
                </div>
              ))}
            </div>
          </fieldset>

          {error ? <InlineError>{error}</InlineError> : null}
          {me?.user.email ? (
            <p className="text-[11.5px] text-subtle">
              Your email address is private and never shown on your profile.
            </p>
          ) : null}
        </div>
      </SettingsCard>
    </div>
  );
}
