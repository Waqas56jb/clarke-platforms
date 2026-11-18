import { ArrowLeft, Ban, MoreVertical, Phone, User, Video } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import Avatar from '../Avatar';
import Menu from '../ui/Menu';

export default function ChatHeader({ other, canMessage, onBack, onCall, onBlock }) {
  const { showView } = useNavigation();
  const openProfile = () => showView('member', { id: other.id });

  return (
    <header className="chat-thread-head">
      <button type="button" className="icon-btn chat-back" aria-label="Back to conversations" onClick={onBack}>
        <ArrowLeft size={22} aria-hidden="true" />
      </button>
      {other && (
        <>
          <Avatar src={other.avatar} name={other.displayName} />
          <button
            type="button"
            className="chat-peer"
            onClick={openProfile}
            aria-label={`View ${other.displayName}'s profile`}
          >
            <b className="truncate">{other.displayName}</b>
            <span className="truncate">@{other.username}</span>
          </button>
          <div className="chat-thread-actions">
            {canMessage && (
              <>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Start voice call"
                  onClick={() => onCall('audio')}
                >
                  <Phone size={20} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Start video call"
                  onClick={() => onCall('video')}
                >
                  <Video size={20} aria-hidden="true" />
                </button>
              </>
            )}
            <Menu
              label="More options"
              trigger={<MoreVertical size={20} aria-hidden="true" />}
              items={[
                { label: 'View profile', icon: <User size={20} aria-hidden="true" />, onSelect: openProfile },
                { separator: true },
                { label: 'Block', icon: <Ban size={20} aria-hidden="true" />, onSelect: onBlock, danger: true },
              ]}
            />
          </div>
        </>
      )}
    </header>
  );
}
