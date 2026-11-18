import { useState } from 'react';
import ChatThread from '../components/messages/ChatThread';
import ConversationList from '../components/messages/ConversationList';
import { AsyncView } from '../components/StateView';
import ViewHeading from '../components/ViewHeading';
import { useSocketEvent } from '../context/SocketContext';
import { useAsync } from '../hooks/useAsync';
import { listContacts, listConversations } from '../services/messagesService';

export default function MessagesPage({ params }) {
  const [activeId, setActiveId] = useState(params.userId || null);
  const lists = useAsync(
    () =>
      Promise.all([listConversations(), listContacts()]).then(([c, k]) => ({
        conversations: c.conversations,
        contacts: k.contacts,
      })),
    []
  );

  useSocketEvent('message:new', () => lists.reload());

  return (
    <>
      <ViewHeading title="Private messages" subtitle="Chat one-to-one with your matches and mutual followers." />
      <AsyncView state={lists} loadingText="Loading messages…">
        {(data) => (
          <div className={`card-panel chat-layout${activeId ? ' thread-open' : ''}`}>
            <ConversationList
              conversations={data.conversations}
              contacts={data.contacts}
              activeId={activeId}
              onOpen={setActiveId}
            />
            {activeId ? (
              <ChatThread key={activeId} userId={activeId} onBack={() => setActiveId(null)} onChanged={lists.reload} />
            ) : (
              <div className="chat-thread">
                <div className="empty-state" style={{ margin: 16 }}>
                  <div style={{ fontSize: 30, color: 'var(--blue)' }}>▤</div>
                  <b>Choose a conversation</b>
                  <p>Pick someone on the left to start chatting.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </AsyncView>
      <p className="fine-print">
        Messages are stored on Clarke&apos;s servers so you can read them on any device. They are not end-to-end
        encrypted, so do not share passwords, card details or other sensitive information in chat.
      </p>
    </>
  );
}
