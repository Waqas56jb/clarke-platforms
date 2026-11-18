import { MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../utils/format';
import Avatar from '../Avatar';
import Dialog from '../ui/Dialog';

// Shown after a like turns into a mutual match. It never opens a chat on its own.
export default function MatchDialog({ match, onMessage, onClose }) {
  const { user } = useAuth();
  const name = match.display_name;
  return (
    <Dialog label="It's a Match!" onClose={onClose} fullOnMobile className="match-dialog">
      <div className="match-body">
        <div className="match-photos" aria-hidden="true">
          <Avatar src={user?.avatar} name={user?.displayName} size="xxl" className="match-photo" />
          {match.photo_url ? (
            <img className="avatar avatar-xxl match-photo" src={match.photo_url} alt="" />
          ) : (
            <span className="avatar avatar-xxl match-photo">{initials(name)}</span>
          )}
        </div>
        <h2 className="match-title">It&apos;s a Match!</h2>
        <p className="match-text">You and {name} liked each other.</p>
        <div className="match-actions">
          <button type="button" className="btn btn-primary btn-block" onClick={onMessage} data-autofocus>
            <MessageCircle size={20} aria-hidden="true" />
            Send a Message
          </button>
          <button type="button" className="btn btn-secondary btn-block" onClick={onClose}>
            Keep Discovering
          </button>
        </div>
      </div>
    </Dialog>
  );
}
