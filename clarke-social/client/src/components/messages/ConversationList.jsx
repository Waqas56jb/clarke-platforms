import Avatar from '../Avatar';
import { timeAgo } from '../../utils/format';

export default function ConversationList({ conversations, contacts, activeId, onOpen }) {
  const withChat = new Set(conversations.map((c) => c.user.id));
  const newContacts = contacts.filter((u) => !withChat.has(u.id));
  return (
    <div className="chat-list">
      <h3>CONVERSATIONS</h3>
      {conversations.length === 0 && (
        <p className="dating-muted" style={{ padding: '0 14px', fontSize: 11 }}>
          No conversations yet.
        </p>
      )}
      {conversations.map((c) => (
        <button
          key={c.user.id}
          className={`chat-item${c.user.id === activeId ? ' active' : ''}`}
          onClick={() => onOpen(c.user.id)}
        >
          <Avatar src={c.user.avatar} name={c.user.displayName} />
          <span>
            <b>{c.user.displayName}</b>
            <small>
              {c.lastMessage.fromMe ? 'You: ' : ''}
              {c.lastMessage.body} · {timeAgo(c.lastMessage.createdAt)}
            </small>
          </span>
          {c.unread > 0 && <span className="chat-unread">{c.unread}</span>}
        </button>
      ))}
      <h3>START A CONVERSATION</h3>
      {newContacts.length === 0 && (
        <p className="dating-muted" style={{ padding: '0 14px 14px', fontSize: 11, lineHeight: 1.5 }}>
          You can message dating matches and members who follow you back.
        </p>
      )}
      {newContacts.map((u) => (
        <button key={u.id} className={`chat-item${u.id === activeId ? ' active' : ''}`} onClick={() => onOpen(u.id)}>
          <Avatar src={u.avatar} name={u.displayName} />
          <span>
            <b>{u.displayName}</b>
            <small>@{u.username}</small>
          </span>
        </button>
      ))}
    </div>
  );
}
