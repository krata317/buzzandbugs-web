import { Link } from 'react-router-dom';
import { useState } from 'react';
import { UserMinus, UserPlus } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useFollow } from '@/features/users/queries';
import { Button, buttonStyles, type ButtonSize } from '@/components/ui/Button';
import { useToast } from '@/providers/ToastProvider';
import { errorMessage } from '@/lib/api';

interface FollowButtonProps {
  username: string;
  isFollowing: boolean;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export function FollowButton({ username, isFollowing, size = 'sm', fullWidth }: FollowButtonProps) {
  const { isAuthenticated } = useAuth();
  const follow = useFollow();
  const toast = useToast();
  const [hovering, setHovering] = useState(false);

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        className={buttonStyles({ variant: 'primary', size, fullWidth })}
        aria-label={`Sign in to follow @${username}`}
      >
        Follow
      </Link>
    );
  }

  const label = isFollowing ? (hovering ? 'Unfollow' : 'Following') : 'Follow';

  return (
    <Button
      variant={isFollowing ? 'secondary' : 'primary'}
      size={size}
      fullWidth={fullWidth}
      loading={follow.isPending}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={() =>
        follow.mutate(
          { username, follow: !isFollowing },
          {
            onError: (error) =>
              toast.push({ title: 'Could not update follow', description: errorMessage(error), tone: 'error' }),
          },
        )
      }
      iconLeft={
        isFollowing ? (
          hovering ? (
            <UserMinus size={13} aria-hidden="true" />
          ) : undefined
        ) : (
          <UserPlus size={13} aria-hidden="true" />
        )
      }
    >
      {label}
    </Button>
  );
}
