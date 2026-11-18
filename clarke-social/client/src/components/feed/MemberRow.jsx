import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { toggleFollow } from '../../services/usersService';
import Avatar from '../Avatar';

// A member in a list (Discover, followers, following) with an optimistic Follow / Following button.
// onFollowChange(id, following) updates the list on screen.
export default function MemberRow({ member: m, onFollowChange }) {
  const { user } = useAuth();
  const { navigate, openAuth } = useNavigation();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const self = user?.id === m.id;

  const follow = async () => {
    if (!user) return openAuth();
    const wanted = !m.isFollowing;
    onFollowChange(m.id, wanted);
    setBusy(true);
    try {
      const { following } = await toggleFollow(m.id);
      if (following !== wanted) onFollowChange(m.id, following);
    } catch (err) {
      onFollowChange(m.id, !wanted);
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="member-row">
      <button type="button" className="member-row-link" onClick={() => navigate('member', { id: m.id })}>
        <Avatar src={m.avatar} name={m.displayName} size="md" />
        <span className="list-row-main">
          <span className="list-row-title">{m.displayName}</span>
          <span className="list-row-sub">
            @{m.username}
            {m.bio ? ` · ${m.bio}` : ''}
          </span>
        </span>
      </button>
      {self ? (
        <span className="badge badge-neutral">You</span>
      ) : (
        <button
          type="button"
          className={`btn btn-sm follow-btn ${m.isFollowing ? 'btn-secondary following' : 'btn-primary'}`}
          aria-label={`${m.isFollowing ? 'Following' : 'Follow'} ${m.displayName}`}
          onClick={follow}
          disabled={busy}
        >
          {m.isFollowing ? 'Following' : 'Follow'}
        </button>
      )}
    </li>
  );
}
