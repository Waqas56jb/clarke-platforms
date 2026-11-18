import { useState } from 'react';
import { MessageCircle, Search } from 'lucide-react';
import Avatar from '../Avatar';
import { EmptyState } from '../StateView';
import { shortTime } from './chatTime';

const matches = (user, q) =>
  !q || user.displayName?.toLowerCase().includes(q) || user.username?.toLowerCase().includes(q);

function ConversationRow({ conversation: c, active, onOpen }) {
  const { user, lastMessage, unread } = c;
  return (
    <button
      type="button"
      className={`chat-item${active ? ' active' : ''}${unread ? ' unread' : ''}`}
      aria-current={active || undefined}
      onClick={() => onOpen(user.id)}
    >
      <Avatar src={user.avatar} name={user.displayName} />
      <span className="chat-item-main">
        <span className="chat-item-top">
          <b className="truncate">{user.displayName}</b>
          <time dateTime={lastMessage.createdAt}>{shortTime(lastMessage.createdAt)}</time>
        </span>
        <span className="chat-item-bottom">
          <span className="truncate">
            {lastMessage.fromMe ? 'You: ' : ''}
            {lastMessage.body}
          </span>
          {unread > 0 && (
            <span className="count-badge" aria-label={`${unread} unread`}>
              {unread}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}

function ContactRow({ user, active, onOpen }) {
  return (
    <button type="button" className={`chat-item${active ? ' active' : ''}`} onClick={() => onOpen(user.id)}>
      <Avatar src={user.avatar} name={user.displayName} />
      <span className="chat-item-main">
        <b className="truncate">{user.displayName}</b>
        <span className="chat-item-bottom">
          <span className="truncate">@{user.username}</span>
        </span>
      </span>
    </button>
  );
}

export default function ConversationList({ conversations, contacts, activeId, onOpen }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const withChat = new Set(conversations.map((c) => c.user.id));
  const shownChats = conversations.filter((c) => matches(c.user, q));
  const shownContacts = contacts.filter((u) => !withChat.has(u.id) && matches(u, q));
  const nothingFound = q && !shownChats.length && !shownContacts.length;

  return (
    <nav className="chat-list" aria-label="Conversations">
      <div className="chat-list-head">
        <label className="search-field">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Search conversations</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people"
            autoComplete="off"
          />
        </label>
      </div>
      <div className="chat-list-scroll">
        {nothingFound ? (
          <EmptyState icon={Search} title="No results found." plain>
            Try another name or keyword.
          </EmptyState>
        ) : (
          <>
            <h2 className="chat-list-heading">Conversations</h2>
            {conversations.length === 0 && (
              <EmptyState icon={MessageCircle} title="No conversations yet." plain>
                Start a conversation with someone in the Clarke community.
              </EmptyState>
            )}
            {shownChats.map((c) => (
              <ConversationRow key={c.user.id} conversation={c} active={c.user.id === activeId} onOpen={onOpen} />
            ))}
            <h2 className="chat-list-heading">Start a conversation</h2>
            {shownContacts.length === 0 && !q && (
              <p className="chat-list-note">You can message dating matches and members who follow you back.</p>
            )}
            {shownContacts.map((u) => (
              <ContactRow key={u.id} user={u} active={u.id === activeId} onOpen={onOpen} />
            ))}
          </>
        )}
      </div>
    </nav>
  );
}
