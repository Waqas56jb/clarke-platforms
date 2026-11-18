import { useState } from 'react';
import { MessagesSquare } from 'lucide-react';
import ChatThread from '../components/messages/ChatThread';
import ConversationList from '../components/messages/ConversationList';
import { EmptyState, ErrorState, Loading } from '../components/StateView';
import { useSocketEvent } from '../context/SocketContext';
import { useAsync } from '../hooks/useAsync';
import { listContacts, listConversations } from '../services/messagesService';

const loadLists = () =>
  Promise.all([listConversations(), listContacts()]).then(([c, k]) => ({
    conversations: c.conversations,
    contacts: k.contacts,
  }));

function ListPane({ lists, activeId, onOpen }) {
  if (lists.loading && !lists.data)
    return (
      <div className="chat-list chat-list-pad">
        <Loading variant="list" count={6} text="Loading conversations" />
      </div>
    );
  if (lists.error && !lists.data)
    return (
      <div className="chat-list">
        <ErrorState
          title="Couldn't load messages"
          message="Your messages couldn't be loaded. Check your connection and retry."
          onRetry={lists.reload}
          plain
        />
      </div>
    );
  return (
    <ConversationList
      conversations={lists.data.conversations}
      contacts={lists.data.contacts}
      activeId={activeId}
      onOpen={onOpen}
    />
  );
}

export default function MessagesPage({ params }) {
  const [activeId, setActiveId] = useState(params.userId || null);
  const [requestedId, setRequestedId] = useState(params.userId);
  const lists = useAsync(loadLists, []);

  // Opening Messages for a specific member (from a profile or match) while already on this screen.
  if (params.userId !== requestedId) {
    setRequestedId(params.userId);
    if (params.userId) setActiveId(params.userId);
  }

  useSocketEvent('message:new', () => lists.reload());

  return (
    <>
      <header className="page-header messages-header">
        <div>
          <h1>Messages</h1>
          <p>Chat one-to-one with your matches and mutual followers.</p>
        </div>
      </header>
      <div className={`card messages-layout${activeId ? ' thread-open' : ''}`}>
        <ListPane lists={lists} activeId={activeId} onOpen={setActiveId} />
        {activeId ? (
          <ChatThread key={activeId} userId={activeId} onBack={() => setActiveId(null)} onChanged={lists.reload} />
        ) : (
          <div className="chat-thread chat-thread-idle">
            <EmptyState icon={MessagesSquare} title="Choose a conversation" plain>
              Pick someone from the list to start chatting.
            </EmptyState>
          </div>
        )}
      </div>
      <p className="fine-print">
        Messages are stored on Clarke&apos;s servers so you can read them on any device. They are not end-to-end
        encrypted, so don&apos;t share passwords, card details or other sensitive information in chat.
      </p>
    </>
  );
}
