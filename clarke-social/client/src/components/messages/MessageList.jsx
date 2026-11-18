import { Fragment, useEffect, useRef } from 'react';
import { clockTime, dayKey, dayLabel } from './chatTime';

function Bubble({ mine, body, createdAt, children }) {
  return (
    <div className={`chat-msg${mine ? ' mine' : ''}`}>
      <div className={`chat-bubble${mine ? ' mine' : ''}`}>{body}</div>
      <div className="chat-meta">
        <time dateTime={createdAt}>{clockTime(createdAt)}</time>
        {children}
      </div>
    </div>
  );
}

function PendingBubble({ item, onRetry, onRemove }) {
  const failed = item.status === 'failed';
  return (
    <Bubble mine body={item.body} createdAt={item.createdAt}>
      {failed ? (
        <>
          <span className="chat-failed">Failed</span>
          <button type="button" className="btn-link" onClick={() => onRetry(item)}>
            Retry
          </button>
          <button type="button" className="btn-link chat-remove" onClick={() => onRemove(item)}>
            Remove
          </button>
        </>
      ) : (
        <span>Sending…</span>
      )}
    </Bubble>
  );
}

// Messages grouped under day separators, newest at the bottom; scrolls down as messages arrive.
export default function MessageList({ messages, pending, myId, otherName, onRetry, onRemove }) {
  const ref = useRef(null);
  const count = messages.length + pending.length;
  const lastMine = pending.length ? null : messages.findLast((m) => m.senderId === myId)?.id;
  const items = [
    ...messages.map((m) => ({ key: m.id, createdAt: m.createdAt, message: m })),
    ...pending.map((p) => ({ key: p.tempId, createdAt: p.createdAt, pending: p })),
  ];

  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [count]);

  return (
    <div className="chat-messages" ref={ref} aria-live="polite" aria-label={`Messages with ${otherName}`} tabIndex={0}>
      {count === 0 && <p className="chat-hello">Say hello to {otherName}. Your conversation starts here.</p>}
      {items.map(({ key, createdAt, message: m, pending: p }, i) => {
        const newDay = i === 0 || dayKey(items[i - 1].createdAt) !== dayKey(createdAt);
        const mine = Boolean(p) || m.senderId === myId;
        return (
          <Fragment key={key}>
            {newDay && (
              <div className="chat-day" role="separator">
                <span>{dayLabel(createdAt)}</span>
              </div>
            )}
            {p ? (
              <PendingBubble item={p} onRetry={onRetry} onRemove={onRemove} />
            ) : (
              <Bubble mine={mine} body={m.body} createdAt={createdAt}>
                {mine && m.id === lastMine && <span>{m.read ? 'Seen' : 'Sent'}</span>}
              </Bubble>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
