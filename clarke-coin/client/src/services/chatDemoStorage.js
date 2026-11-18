// Local interactive messaging prototype storage. This is NOT live messaging or end-to-end encryption.
import { INITIAL_CHATS } from '../utils/demoData';

const CHAT_STORE = 'clarkeCoinChats_demo_v1';

export function loadChats() {
  try {
    return JSON.parse(localStorage.getItem(CHAT_STORE)) || INITIAL_CHATS;
  } catch {
    return INITIAL_CHATS;
  }
}

export function saveChats(chats) {
  try {
    localStorage.setItem(CHAT_STORE, JSON.stringify(chats));
  } catch {
    // Storage may be full or disabled; the conversation still works for this page view.
  }
}
