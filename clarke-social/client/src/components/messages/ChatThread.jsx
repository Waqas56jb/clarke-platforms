import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCalls } from '../../context/CallContext';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { useSocketEvent } from '../../context/SocketContext';
import { useAsync } from '../../hooks/useAsync';
import { getThread, markRead, sendMessage } from '../../services/messagesService';
import { blockMember } from '../../services/usersService';
import { formatDateTime } from '../../utils/format';
import Avatar from '../Avatar';
import { AsyncView } from '../StateView';

export default function ChatThread({ userId, onBack, onChanged }) {
  const { user, refresh } = useAuth();
  const { showView } = useNavigation();
  const { startCall } = useCalls();
  const toast = useToast();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);
  const state = useAsync(() => getThread(userId), [userId]);

  const read = () =>
    markRead(userId)
      .then(() => {
        refresh();
        onChanged();
      })
      .catch(() => {});

  useEffect(() => {
    if (state.data) read();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.data?.user.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [state.data?.messages.length]);

  useSocketEvent('message:new', (m) => {
    const partner = m.senderId === user.id ? m.recipientId : m.senderId;
    if (partner !== userId) return;
    state.setData((d) => (d.messages.some((x) => x.id === m.id) ? d : { ...d, messages: [...d.messages, m] }));
    if (m.senderId === userId) read();
  });
  useSocketEvent('message:read', ({ readerId }) => {
    if (readerId === userId) state.setData((d) => ({ ...d, messages: d.messages.map((m) => ({ ...m, read: true })) }));
  });

  const onSend = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setSending(true);
    try {
      const { message } = await sendMessage(userId, body);
      setText('');
      state.setData((d) =>
        d.messages.some((x) => x.id === message.id) ? d : { ...d, messages: [...d.messages, message] }
      );
      onChanged();
    } catch (err) {
      toast(err.message);
    } finally {
      setSending(false);
    }
  };

  const block = async (other) => {
    if (!window.confirm(`Block ${other.displayName}? You will no longer be able to message or call each other.`))
      return;
    try {
      const r = await blockMember(other.id);
      toast(r.message);
      state.reload();
      onChanged();
    } catch (err) {
      toast(err.message);
    }
  };

  const call = (other, type) => {
    showView('calls');
    startCall(type, other.id, other.displayName);
  };

  return (
    <div className="chat-thread">
      <AsyncView state={state} loadingText="Loading conversation…">
        {({ user: other, messages, canMessage }) => (
          <>
            <div className="chat-thread-head">
              <button className="btn chat-back" onClick={onBack} aria-label="Back to conversations">
                ←
              </button>
              <Avatar src={other.avatar} name={other.displayName} />
              <div className="person-info">
                <b>{other.displayName}</b>
                <small>@{other.username}</small>
              </div>
              <div className="chat-thread-actions">
                {canMessage && (
                  <>
                    <button className="btn" onClick={() => call(other, 'audio')}>
                      Call
                    </button>
                    <button className="btn" onClick={() => call(other, 'video')}>
                      Video
                    </button>
                  </>
                )}
                <button className="btn dating-more" onClick={() => block(other)}>
                  Block
                </button>
              </div>
            </div>
            <div className="chat-messages" aria-live="polite">
              {messages.length === 0 && (
                <p className="dating-muted" style={{ fontSize: 11 }}>
                  Say hello 👋
                </p>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`chat-bubble${m.senderId === user.id ? ' mine' : ''}`}>
                  {m.body}
                  <small>
                    {formatDateTime(m.createdAt)}
                    {m.senderId === user.id && m.read ? ' · Seen' : ''}
                  </small>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            {canMessage ? (
              <form className="chat-compose" onSubmit={onSend}>
                <input
                  placeholder="Write a message…"
                  maxLength={2000}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  aria-label="Write a message"
                />
                <button className="btn btn-primary" disabled={sending}>
                  Send
                </button>
              </form>
            ) : (
              <p className="chat-disclaimer" style={{ paddingTop: 12 }}>
                You can no longer message this member. Messaging is available between dating matches and members who
                follow each other, unless either of you has blocked the other.
              </p>
            )}
          </>
        )}
      </AsyncView>
    </div>
  );
}
