import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { listPosts } from '../services/postsService';
import { useSavedPosts } from '../hooks/useSavedPosts';

const FeedContext = createContext(null);

export function FeedProvider({ children }) {
  const { user, ready } = useAuth();
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: '' });
  const [commentPostId, setCommentPostId] = useState(null);
  const saved = useSavedPosts();
  const viewerId = user?.id || 0;

  const loadFeed = useCallback(
    () =>
      listPosts(viewerId)
        .then((data) => {
          setPosts(data.posts);
          setStatus({ loading: false, error: '' });
        })
        .catch((e) => setStatus({ loading: false, error: e.message })),
    [viewerId]
  );

  useEffect(() => {
    if (ready) loadFeed();
  }, [ready, loadFeed]);

  return (
    <FeedContext.Provider value={{ posts, status, loadFeed, saved, commentPostId, setCommentPostId }}>
      {children}
    </FeedContext.Provider>
  );
}

export const useFeed = () => useContext(FeedContext);
