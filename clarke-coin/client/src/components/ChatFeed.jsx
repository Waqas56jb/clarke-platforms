import { useEffect, useRef } from 'react';

export default function ChatFeed({ messages }) {
  const feedRef = useRef(null);
  useEffect(() => {
    feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [messages]);
  return (
    <div className="chat-feed" id="chatFeed" aria-live="polite" ref={feedRef}>
      {messages.map((m, i) => (
        <div className={`chat-bubble${m.from === 'You' ? ' mine' : ''}`} key={i}>
          <div>{m.text}</div>
          <small>
            {m.from} • {m.time}
          </small>
        </div>
      ))}
    </div>
  );
}
