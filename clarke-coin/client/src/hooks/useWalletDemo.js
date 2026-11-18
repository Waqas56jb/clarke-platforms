import { useState } from 'react';
import { loadWalletState, saveWalletState } from '../services/walletDemoStorage';
import { MY_WALLET_ID } from '../utils/demoData';

const round2 = (n) => Math.round(n * 100) / 100;

// Demo wallet-to-wallet transfers between the two sample wallets, persisted in this browser only.
export function useWalletDemo() {
  const [state, setState] = useState(loadWalletState);

  const findRecipient = (rawId) => {
    const id = rawId.trim().toUpperCase();
    const recipient = state.wallets[id];
    if (!id) return { preview: 'Enter a Wallet ID first.' };
    if (!recipient || id === MY_WALLET_ID) return { preview: 'Wallet not found. Check the ID and try again.' };
    return { preview: `Recipient found: ${recipient.name} • ${id}`, recipient: { id, ...recipient } };
  };

  // Debit and credit are applied together in one state update under a single transfer reference.
  const send = (recipient, amount, note) => {
    const transferId = `CCX-${Date.now().toString(36).toUpperCase()}`;
    const createdAt = new Date().toISOString();
    const wallets = {
      ...state.wallets,
      [MY_WALLET_ID]: { ...state.wallets[MY_WALLET_ID], balance: round2(state.wallets[MY_WALLET_ID].balance - amount) },
      [recipient.id]: { ...state.wallets[recipient.id], balance: round2(state.wallets[recipient.id].balance + amount) },
    };
    const record = { id: transferId, amount, status: 'Completed (demo)', createdAt, note };
    const next = {
      wallets,
      transfers: [
        ...state.transfers,
        { ...record, direction: 'Sent', otherWallet: recipient.id },
        { ...record, direction: 'Received', otherWallet: MY_WALLET_ID },
      ],
    };
    saveWalletState(next);
    setState(next);
    return transferId;
  };

  return { balance: state.wallets[MY_WALLET_ID].balance, transfers: state.transfers, findRecipient, send };
}
