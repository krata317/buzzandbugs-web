import { useEffect, useState } from 'react';
import { useReportPost } from '@/features/posts/queries';
import type { ReportReason } from '@/lib/api/types';
import { errorMessage } from '@/lib/api';
import { Modal } from '@/components/ui/overlay';
import { Button } from '@/components/ui/Button';
import { Field, Textarea } from '@/components/ui/form';
import { InlineError } from '@/components/ui/feedback';
import { useToast } from '@/providers/ToastProvider';
import { cn } from '@/lib/cn';

const REASONS: Array<{ value: ReportReason; label: string }> = [
  { value: 'SPAM', label: 'Spam or advertising' },
  { value: 'HARASSMENT', label: 'Harassment or targeted abuse' },
  { value: 'HATE_SPEECH', label: 'Hate speech' },
  { value: 'MISINFORMATION', label: 'Misleading information' },
  { value: 'SEXUAL_CONTENT', label: 'Sexual content' },
  { value: 'VIOLENCE', label: 'Violence or threats' },
  { value: 'SELF_HARM', label: 'Self-harm' },
  { value: 'OTHER', label: 'Something else' },
];

interface ReportDialogProps {
  postId: string;
  open: boolean;
  onClose: () => void;
}

export function ReportDialog({ postId, open, onClose }: ReportDialogProps) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [error, setError] = useState<string | null>(null);
  const report = useReportPost(postId);
  const toast = useToast();

  useEffect(() => {
    if (!open) {
      setReason(null);
      setDetails('');
      setError(null);
    }
  }, [open]);

  const submit = () => {
    if (!reason) {
      setError('Choose a reason for the report.');
      return;
    }
    setError(null);
    report.mutate(
      { reason, details: details.trim() || undefined },
      {
        onSuccess: () => {
          toast.push({
            title: 'Report received',
            description:
              'Moderators review reports. The post stays visible until a decision is made.',
            tone: 'success',
          });
          onClose();
        },
        onError: (mutationError) => setError(errorMessage(mutationError)),
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Report this post"
      description="Reports go to moderators. You can only report a post once."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit} loading={report.isPending}>
            Submit report
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <fieldset>
          <legend className="label">Reason</legend>
          <div className="space-y-1">
            {REASONS.map((option) => (
              <label
                key={option.value}
                className={cn(
                  'flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors',
                  reason === option.value ? 'bg-accent/8 text-ink' : 'text-muted hover:bg-raised',
                )}
              >
                <input
                  type="radio"
                  name="report-reason"
                  value={option.value}
                  checked={reason === option.value}
                  onChange={() => setReason(option.value)}
                  className="h-3.5 w-3.5 accent-[rgb(var(--accent))]"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <Field label="Additional context" htmlFor="report-details" optional>
          <Textarea
            id="report-details"
            value={details}
            maxLength={1000}
            rows={3}
            placeholder="Anything that helps a moderator understand the problem."
            onChange={(event) => setDetails(event.target.value)}
          />
        </Field>

        {error ? <InlineError>{error}</InlineError> : null}
      </div>
    </Modal>
  );
}
