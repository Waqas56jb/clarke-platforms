// Local interactive messaging prototype. This is NOT live messaging or E2EE.
import { useState } from 'react';
import ChatFeed from '../components/ChatFeed';
import { useChatDemo } from '../hooks/useChatDemo';
import { ROOMS, ROOM_INFO } from '../utils/demoData';

const BADGES = ['Member conversations', 'Trading rooms', 'Community updates', 'Support access'];

export default function MessagingSection() {
  const { chats, activeRoom, setActiveRoom, messages, sendMessage } = useChatDemo();
  // null until the search box is first used; afterwards every room carries an explicit display, as before.
  const [search, setSearch] = useState(null);
  const [draft, setDraft] = useState('');
  const info = ROOM_INFO[activeRoom];

  const matches = (room) => {
    const hay = `${room.label}${room.hint} ${(chats[room.id] || []).map((m) => m.text).join(' ')}`.toLowerCase();
    return hay.includes((search || '').toLowerCase());
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    sendMessage(text);
    setDraft('');
  };

  return (
    <section className="panel" id="messaging" style={{ marginTop: 15 }}>
      <div className="chart-head">
        <div>
          <h3>✉ CLARKE CONNECT — MESSAGING CENTRE</h3>
          <div className="muted">
            Keep trading conversations, community discussions and customer support in one place.
          </div>
        </div>
        <span className="pill">Interactive preview</span>
      </div>
      <div className="chat-badges">
        {BADGES.map((b) => (
          <span key={b}>{b}</span>
        ))}
      </div>
      <div className="chat-shell" style={{ marginTop: 14 }}>
        <aside className="chat-side">
          <input
            className="chat-search"
            id="chatSearch"
            placeholder="Search conversations…"
            aria-label="Search conversations"
            value={search ?? ''}
            onChange={(e) => setSearch(e.target.value)}
          />
          <h4>YOUR CONVERSATIONS</h4>
          <div className="chat-room-list" id="chatRoomList">
            {ROOMS.map((room) => (
              <button
                key={room.id}
                className={`chat-room${room.id === activeRoom ? ' active' : ''}`}
                data-room={room.id}
                style={search === null ? undefined : { display: matches(room) ? 'block' : 'none' }}
                onClick={() => setActiveRoom(room.id)}
              >
                {room.label}
                <small>{room.hint}</small>
              </button>
            ))}
          </div>
          <p className="chat-meta" style={{ marginTop: 18 }}>
            Community rooms are public to members. Private conversations are intended for their participants only.
          </p>
        </aside>
        <div className="chat-main">
          <div className="chat-top">
            <div>
              <h3 id="chatTitle">{info.title}</h3>
              <div className="chat-meta" id="chatSubtitle">
                {info.subtitle}
              </div>
            </div>
            <span className="pill" id="chatOnline">
              {info.online}
            </span>
          </div>
          <div className="chat-notice" id="chatSecurityNotice">
            Preview mode: messages are saved in this browser only. End-to-end encryption, real accounts, server sync and
            live delivery are not connected yet. Do not enter private or financial information.
          </div>
          <ChatFeed messages={messages} />
          <form className="chat-compose" id="chatForm" onSubmit={onSubmit}>
            <input
              id="chatInput"
              maxLength={1000}
              autoComplete="off"
              placeholder="Write a message…"
              aria-label="Write a message"
              required
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button className="btn" type="submit">
              Send
            </button>
          </form>
        </div>
      </div>
      <div className="chat-meta" style={{ marginTop: 10 }}>
        Demo conversations are stored locally on this device. Public rooms require moderation tools; private chat
        requires production-grade end-to-end encryption and key verification before launch.
      </div>
    </section>
  );
}
