import { createContext, useCallback, useContext, useRef, useState } from 'react';
import DemoMessage from '../components/DemoMessage';

const DemoMessageContext = createContext(null);

// "This is a website preview" notice shown by the trade buttons for 3.5 seconds.
export function DemoMessageProvider({ children }) {
  const [visible, setVisible] = useState(false);
  const timer = useRef(null);

  const showDemoMessage = useCallback(() => {
    setVisible(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 3500);
  }, []);

  return (
    <DemoMessageContext.Provider value={showDemoMessage}>
      {children}
      <DemoMessage visible={visible} />
    </DemoMessageContext.Provider>
  );
}

export const useDemoMessage = () => useContext(DemoMessageContext);
