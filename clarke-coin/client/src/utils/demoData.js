// Sample data from the original preview. Not real accounts, balances or messages.
export const MY_WALLET_ID = 'CCW-100001';

export const DEMO_WALLETS = {
  'CCW-100001': { name: 'Demo Customer', balance: 1000 },
  'CCW-100002': { name: 'Alex Morgan', balance: 250 },
};

export const ROOMS = [
  { id: 'market', label: '# Market Square', hint: 'Community discussion' },
  { id: 'trading', label: '# Trading Floor', hint: 'Trading discussion' },
  { id: 'support', label: '◈ Customer Support', hint: 'Help and account assistance' },
  { id: 'alex', label: '● Alex Morgan', hint: 'Demo member conversation' },
];

export const ROOM_INFO = {
  market: { title: '# Market Square', subtitle: 'Community discussion • member room', online: 'Community' },
  trading: { title: '# Trading Floor', subtitle: 'Trading discussion • member room', online: 'Community' },
  support: { title: '◈ Customer Support', subtitle: 'Help requests • demo support queue', online: 'Support demo' },
  alex: { title: 'Alex Morgan', subtitle: 'Private member conversation • demo', online: 'Demo member' },
};

export const INITIAL_CHATS = {
  market: [
    {
      from: 'Clarke Team',
      text: 'Welcome to Market Square. Keep discussions respectful and never share passwords or recovery phrases.',
      time: 'Welcome',
    },
  ],
  trading: [
    {
      from: 'Clarke Team',
      text: 'Welcome to the Trading Floor. This room is for general discussion only; no live orders are placed here.',
      time: 'Welcome',
    },
  ],
  support: [
    {
      from: 'Clarke Support',
      text: 'Hello! Describe your account or transfer question here. This preview does not create a real support ticket.',
      time: 'Welcome',
    },
  ],
  alex: [{ from: 'Alex Morgan', text: 'Hi! Welcome to the Clarke Coin demo conversation.', time: 'Welcome' }],
};
