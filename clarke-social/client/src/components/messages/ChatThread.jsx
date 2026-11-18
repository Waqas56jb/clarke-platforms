import { useEffect, useRef, useState } from 'react';
import { Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCalls } from '../../context/CallContext';
import { useToast } from '../../context/ToastContext';
import { useSocketEvent } from '../../context/SocketContext';
import { useAsync } from '../../hooks/useAsync';
import { getThread, markRead, sendMessage } from '../../services/messagesService';
import { blockMember } from '../../services/usersService';
import { ErrorState, Loading } from '../StateView';
import { useConfirm } from '../ui/ConfirmDialog';
import ChatComposer from './ChatComposer';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';

const appendOnce = (d, message) =>
  d.messages.some((x) => x.id === message.id) ? d : { ...d, messages: [...d.messages, message] };

export default function ChatThread({ userId, onBack, onChanged }) {
  const { user, refresh } = useAuth();
  const { startCall } = useCalls();
  const { confirm } = useConfirm();
  const toast = useToast();
  const state = useAsync(() => getThread(userId), [userId]);
  // Messages typed here that the server has not confirmed yet: { tempId, body, createdAt, status }.
  const [pending, setPending] = useState([]);
  const nextTemp = useRef(0);
  const other = state.data?.user;

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

  useSocketEvent('message:new', (m) => {
    const partner = m.senderId === user.id ? m.recipientId : m.senderId;
    if (partner !== userId || !state.data) return;
    state.setData((d) => appendOnce(d, m));
    if (m.senderId === userId) read();
  });
  useSocketEvent('message:read', ({ readerId }) => {
    if (readerId === userId && state.data)
      state.setData((d) => ({ ...d, messages: d.messages.map((m) => ({ ...m, read: true })) }));
  });

  const deliver = async (item) => {
    try {
      const { message } = await sendMessage(userId, item.body);
      setPending((p) => p.filter((x) => x.tempId !== item.tempId));
      state.setData((d) => appendOnce(d, message));
      onChanged();
    } catch (err) {
      setPending((p) => p.map((x) => (x.tempId === item.tempId ? { ...x, status: 'failed' } : x)));
      toast(err.message, 'error');
    }
  };

  const send = (body) => {
    nextTemp.current += 1;
    const item = {
      tempId: `pending-${nextTemp.current}`,
      body,
      createdAt: new Date().toISOString(),
      status: 'sending',
    };
    setPending((p) => [...p, item]);
    deliver(item);
  };

  const retry = (item) => {
    setPending((p) => p.map((x) => (x.tempId === item.tempId ? { ...x, status: 'sending' } : x)));
    deliver(item);
  };

  const remove = (item) => setPending((p) => p.filter((x) => x.tempId !== item.tempId));

  const block = async () => {
    const ok = await confirm({
      title: `Block ${other.displayName}?`,
      message: 'You will no longer be able to message or call each other.',
      confirmLabel: 'Block',
      danger: true,
    });
    if (!ok) return;
    try {
      const r = await blockMember(other.id);
      toast(r.message, 'success');
      state.reload();
      onChanged();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  let body;
  if (state.loading && !state.data)
    body = (
      <div className="chat-messages">
        <Loading variant="chat" count={2} text="Loading conversation" />
      </div>
    );
  else if (state.error && !state.data)
    body = (
      <div className="chat-messages">
        <ErrorState
          title="Couldn't load this conversation"
          message="Your messages couldn't be loaded. Check your connection and retry."
          onRetry={state.reload}
          plain
        />
      </div>
    );
  else
    body = (
      <>
        <MessageList
          messages={state.data.messages}
          pending={pending}
          myId={user.id}
          otherName={other.displayName}
          onRetry={retry}
          onRemove={remove}
        />
        {state.data.canMessage ? (
          <ChatComposer onSend={send} />
        ) : (
          <div className="chat-locked">
            <div className="notice">
              <Info size={20} aria-hidden="true" />
              <p>
                You can no longer message this member. Messaging is available between dating matches and members who
                follow each other, unless either of you has blocked the other.
              </p>
            </div>
          </div>
        )}
      </>
    );

  return (
    <section className="chat-thread" aria-label={other ? `Conversation with ${other.displayName}` : 'Conversation'}>
      <ChatHeader
        other={other}
        canMessage={state.data?.canMessage}
        onBack={onBack}
        onCall={(type) => startCall(type, other.id, other.displayName, other.avatar)}
        onBlock={block}
      />
      {body}
    </section>
  );
}
