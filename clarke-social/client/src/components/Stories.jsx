import { useCallback, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useAsync } from '../hooks/useAsync';
import { listStories } from '../services/storiesService';
import Avatar from './Avatar';
import { MEDIA_ACCEPT, releaseMedia, toMedia } from './feed/mediaFile';
import { readSeenStories, saveSeenStories } from './feed/seenStories';
import StoryUploadDialog from './feed/StoryUploadDialog';
import StoryViewer from './StoryViewer';
import { Loading } from './StateView';

const firstName = (name = '') => name.split(' ')[0];

function StoryItem({ group, ring, self, onOpen }) {
  const name = self ? 'You' : firstName(group.user.displayName);
  return (
    <li>
      <button
        type="button"
        className={`story story-${ring}`}
        onClick={onOpen}
        aria-label={`${self ? 'Your' : `${group.user.displayName}'s`} story${ring === 'unseen' ? ', new' : ''}`}
      >
        <span className="story-ring">
          <Avatar src={group.user.avatar} name={group.user.displayName} size="lg" />
        </span>
        <span className="story-name">{name}</span>
      </button>
    </li>
  );
}

// Story rings for the home feed, the "Your story" button and the full-screen viewer.
export default function Stories() {
  const { user } = useAuth();
  const { openAuth } = useNavigation();
  const fileRef = useRef(null);
  const [seen, setSeen] = useState(readSeenStories);
  const [viewing, setViewing] = useState(null);
  const [media, setMedia] = useState(null);
  const state = useAsync(() => listStories().then((d) => d.groups), []);
  const groups = state.data || [];

  const markSeen = useCallback((id) => {
    setSeen((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev).add(id);
      saveSeenStories(next);
      return next;
    });
  }, []);

  const ringFor = (g) => {
    if (g.user.id === user?.id) return 'own';
    return g.stories.every((s) => seen.has(s.id)) ? 'seen' : 'unseen';
  };

  const onFile = (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (file) setMedia(toMedia(file));
  };
  const closeUpload = () => {
    releaseMedia(media);
    setMedia(null);
  };

  return (
    <section className="card stories-card" aria-labelledby="storiesTitle">
      <h2 id="storiesTitle" className="sr-only">
        Stories
      </h2>
      <ul className="stories-row">
        <li>
          <button
            type="button"
            className="story story-add"
            id="addStory"
            onClick={() => (user ? fileRef.current.click() : openAuth())}
            aria-label="Add to your story"
          >
            <span className="story-ring">
              <Avatar src={user?.avatar} name={user?.displayName || 'You'} size="lg" />
              <span className="story-add-badge" aria-hidden="true">
                <Plus size={16} />
              </span>
            </span>
            <span className="story-name">Your story</span>
          </button>
        </li>
        {groups.map((g, i) => (
          <StoryItem
            key={g.user.id}
            group={g}
            self={g.user.id === user?.id}
            ring={ringFor(g)}
            onOpen={() => setViewing(i)}
          />
        ))}
        {state.loading && !state.data && (
          <li className="stories-loading">
            <Loading text="Loading stories" variant="stories" />
          </li>
        )}
        {state.data && !groups.length && <li className="stories-note">No new stories right now.</li>}
        {state.error && !state.data && (
          <li className="stories-note">
            <span>Stories couldn&apos;t load.</span>
            <button type="button" className="btn-link" onClick={state.reload}>
              Try again
            </button>
          </li>
        )}
      </ul>
      <input ref={fileRef} type="file" hidden accept={MEDIA_ACCEPT} onChange={onFile} />
      {media && (
        <StoryUploadDialog
          media={media}
          onClose={closeUpload}
          onShared={() => {
            closeUpload();
            state.reload();
          }}
        />
      )}
      {viewing !== null && groups[viewing] && (
        <StoryViewer
          groups={groups}
          startIndex={viewing}
          onSeen={markSeen}
          onClose={() => setViewing(null)}
          onDeleted={() => {
            setViewing(null);
            state.reload();
          }}
        />
      )}
    </section>
  );
}
