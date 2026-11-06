import { useNavigate } from 'react-router-dom';
import { ArrowBigDown, ArrowBigUp } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatCount } from '@/lib/format';
import { useAuth } from '@/providers/AuthProvider';
import { useVote } from '@/features/posts/queries';
import { useToast } from '@/providers/ToastProvider';
import { errorMessage } from '@/lib/api';
import type { VoteValue } from '@/lib/api/types';

interface VoteControlProps {
  postId: string;
  score: number;
  viewerVote: number;
  size?: 'sm' | 'md';
}

export function VoteControl({ postId, score, viewerVote, size = 'sm' }: VoteControlProps) {
  const { isAuthenticated } = useAuth();
  const vote = useVote();
  const toast = useToast();
  const navigate = useNavigate();

  const cast = (direction: 1 | -1) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const next: VoteValue = viewerVote === direction ? 0 : direction;
    vote.mutate(
      { id: postId, value: next, previous: viewerVote },
      {
        onError: (error) =>
          toast.push({
            title: 'Your vote was not saved',
            description: errorMessage(error),
            tone: 'error',
          }),
      },
    );
  };

  return (
    <div
      className={cn(
        'inline-flex items-center overflow-hidden rounded-md border border-line bg-surface',
        size === 'md' && 'rounded-lg',
      )}
    >
      <button
        type="button"
        onClick={() => cast(1)}
        aria-label="Upvote"
        aria-pressed={viewerVote === 1}
        className={cn(
          'focus-ring flex items-center justify-center transition-colors duration-150',
          size === 'md' ? 'h-8 w-8' : 'h-7 w-7',
          viewerVote === 1 ? 'text-up' : 'text-subtle hover:text-up',
        )}
      >
        <ArrowBigUp
          size={size === 'md' ? 18 : 16}
          fill={viewerVote === 1 ? 'currentColor' : 'none'}
          aria-hidden="true"
        />
      </button>
      <span
        className={cn(
          'min-w-[26px] select-none text-center font-mono tabular-nums',
          size === 'md' ? 'text-[12.5px]' : 'text-[11.5px]',
          viewerVote === 1 ? 'text-up' : viewerVote === -1 ? 'text-down' : 'text-muted',
        )}
        aria-label={`Score ${score}`}
      >
        {formatCount(score)}
      </span>
      <button
        type="button"
        onClick={() => cast(-1)}
        aria-label="Downvote"
        aria-pressed={viewerVote === -1}
        className={cn(
          'focus-ring flex items-center justify-center transition-colors duration-150',
          size === 'md' ? 'h-8 w-8' : 'h-7 w-7',
          viewerVote === -1 ? 'text-down' : 'text-subtle hover:text-down',
        )}
      >
        <ArrowBigDown
          size={size === 'md' ? 18 : 16}
          fill={viewerVote === -1 ? 'currentColor' : 'none'}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
