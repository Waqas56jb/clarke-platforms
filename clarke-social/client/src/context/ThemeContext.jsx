// Light, dark or system theme. The choice is a per-device preference kept in localStorage (there is no
// account preferences store on the server); index.html applies it before first paint to avoid a flash.
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'clarke-theme';
const ThemeContext = createContext(null);
const media = () => window.matchMedia('(prefers-color-scheme: dark)');

function readChoice() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch {
    return 'system';
  }
}

function apply(choice) {
  const dark = choice === 'dark' || (choice === 'system' && media().matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0b1220' : '#ffffff');
}

export function ThemeProvider({ children }) {
  const [choice, setChoiceState] = useState(readChoice);

  useEffect(() => {
    apply(choice);
    if (choice !== 'system') return undefined;
    const query = media();
    const onChange = () => apply('system');
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [choice]);

  const setChoice = useCallback((next) => {
    try {
      if (next === 'system') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable (private mode); the theme still applies for this visit.
    }
    setChoiceState(next);
  }, []);

  return <ThemeContext.Provider value={{ choice, setChoice }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
