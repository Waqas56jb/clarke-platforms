// Local-only wallet transfer demonstration. Production transfers must be validated and committed by the
// authenticated Clarke Coin backend, never by browser storage.
import { DEMO_WALLETS } from '../utils/demoData';

const STORAGE_KEY = 'clarkeCoinWalletDemo_v1';

export function loadWalletState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.wallets && saved.transfers) return saved;
  } catch {
    // Missing or unreadable demo data falls back to the starting sample wallets.
  }
  return { wallets: structuredClone(DEMO_WALLETS), transfers: [] };
}

export const saveWalletState = (state) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
