import { Share2 } from 'lucide-react';
import { useToast } from '@/providers/ToastProvider';
import { cn } from '@/lib/cn';

interface ShareButtonProps {
  postId: string;
  title: string;
  className?: string;
}

export function ShareButton({ postId, title, className }: ShareButtonProps) {
  const toast = useToast();

  const share = async () => {
    const url = `${window.location.origin}/posts/${postId}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // The user dismissed the share sheet; fall back to copying.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.push({ title: 'Link copied', description: url, tone: 'success' });
    } catch {
      toast.push({
        title: 'Could not copy the link',
        description: 'Copy it from the address bar instead.',
        tone: 'error',
      });
    }
  };

  return (
    <button
      type="button"
      onClick={() => void share()}
      aria-label="Share this post"
      className={cn(
        'focus-ring inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-[12.5px] text-muted transition-colors hover:bg-raised hover:text-ink',
        className,
      )}
    >
      <Share2 size={14} aria-hidden="true" />
      <span className="hidden sm:inline">Share</span>
    </button>
  );
}
