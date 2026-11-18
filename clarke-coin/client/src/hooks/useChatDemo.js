import { useState } from 'react';
import { loadChats, saveChats } from '../services/chatDemoStorage';

export function useChatDemo() {
  const [chats, setChats] = useState(loadChats);
  const [activeRoom, setActiveRoom] = useState('market');

  const sendMessage = (text) => {
    const next = {
      ...chats,
      [activeRoom]: [...(chats[activeRoom] || []), { from: 'You', text, time: new Date().toLocaleString() }],
    };
    saveChats(next);
    setChats(next);
  };

  return { chats, activeRoom, setActiveRoom, messages: chats[activeRoom] || [], sendMessage };
}
