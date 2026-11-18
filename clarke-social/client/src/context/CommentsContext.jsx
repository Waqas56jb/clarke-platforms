// Which post's comments are open, plus a callback so the post on screen can update its count.
import { createContext, useCallback, useContext, useState } from 'react';

const CommentsContext = createContext(null);

export function CommentsProvider({ children }) {
  const [open, setOpen] = useState(null);
  const openComments = useCallback((postId, onAdded) => setOpen({ postId, onAdded }), []);
  const closeComments = useCallback(() => setOpen(null), []);
  return <CommentsContext.Provider value={{ open, openComments, closeComments }}>{children}</CommentsContext.Provider>;
}

export const useComments = () => useContext(CommentsContext);
