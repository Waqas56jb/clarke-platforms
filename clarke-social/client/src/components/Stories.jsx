import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { createStory, listStories } from '../services/storiesService';
import { mediaUrl } from '../services/http';
import { initials } from '../utils/format';
import StoryViewer from './StoryViewer';

const RINGS = ['ring-purple', 'ring-orange', 'ring-green', 'ring-pink', 'ring-cyan'];

export default function Stories() {
  const { user } = useAuth();
  const { openAuth } = useNavigation();
  const toast = useToast();
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [viewing, setViewing] = useState(null);
  const state = useAsync(() => listStories().then((d) => d.groups), []);

  const addStory = () => (user ? fileRef.current.click() : openAuth());

  const onFile = async () => {
    const file = fileRef.current.files[0];
    fileRef.current.value = '';
    if (!file) return;
    const caption = window.prompt('Add a caption to your story (optional)') ?? '';
    setUploading(true);
    try {
      await createStory(caption, file);
      toast('Your story is live for 24 hours.');
      state.reload();
    } catch (e) {
      toast(e.message);
    } finally {
      setUploading(false);
    }
  };

  const groups = state.data || [];

  return (
    <section className="stories-section">
      <div className="section-heading">
        <div>
          <h2>Stories</h2>
          <p>Little moments from your community</p>
        </div>
        <button
          className="text-btn"
          id="storyInfo"
          onClick={() =>
            toast('Share a photo or short video with “Your story”. Stories disappear automatically after 24 hours.')
          }
        >
          How stories work
        </button>
      </div>
      <div className="stories-row">
        <button className="story add-story" id="addStory" onClick={addStory} disabled={uploading}>
          <span className="story-ring">
            <span className="story-plus">{uploading ? '…' : '+'}</span>
          </span>
          <b>{uploading ? 'Uploading' : 'Your story'}</b>
        </button>
        <input
          ref={fileRef}
          type="file"
          hidden
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
          onChange={onFile}
        />
        {state.error && <span className="dating-muted">{state.error}</span>}
        {groups.map((g, i) => (
          <button className="story" key={g.user.id} onClick={() => setViewing(i)}>
            <span className={`story-ring ${RINGS[i % RINGS.length]}`}>
              {g.user.avatar ? (
                <img src={mediaUrl(g.user.avatar)} alt="" />
              ) : (
                <span className="story-person">{initials(g.user.displayName)}</span>
              )}
            </span>
            <b>{g.user.id === user?.id ? 'You' : g.user.displayName.split(' ')[0]}</b>
          </button>
        ))}
      </div>
      {viewing !== null && groups[viewing] && (
        <StoryViewer
          groups={groups}
          startIndex={viewing}
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
