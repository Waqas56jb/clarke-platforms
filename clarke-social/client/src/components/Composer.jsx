import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { useFeed } from '../context/FeedContext';
import { createPost } from '../services/postsService';
import { initials } from '../utils/format';

export default function Composer() {
  const { user } = useAuth();
  const { openAuth } = useNavigation();
  const toast = useToast();
  const { loadFeed } = useFeed();
  const [expanded, setExpanded] = useState(false);
  const [preview, setPreview] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const bodyRef = useRef(null);
  const mediaRef = useRef(null);
  const downloadRef = useRef(null);

  useEffect(() => () => preview && URL.revokeObjectURL(preview.url), [preview]);

  const onMediaChange = () => {
    const file = mediaRef.current.files[0];
    if (!file) {
      setPreview(null);
      return;
    }
    setPreview({ url: URL.createObjectURL(file), isVideo: file.type.startsWith('video/') });
    setExpanded(true);
  };

  const focusPost = () => {
    setExpanded(true);
    setTimeout(() => bodyRef.current?.focus());
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user) return openAuth();
    const file = mediaRef.current.files[0];
    const form = new FormData();
    form.append('body', bodyRef.current.value);
    form.append('allowDownload', downloadRef.current.checked ? 'true' : 'false');
    if (file) form.append('media', file);
    setPublishing(true);
    try {
      await createPost(form);
      bodyRef.current.value = '';
      mediaRef.current.value = '';
      setPreview(null);
      downloadRef.current.checked = false;
      setExpanded(false);
      await loadFeed();
      toast('Your post is live on Clarke.');
    } catch (err) {
      toast(err.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <section className={`composer card-panel${expanded ? ' expanded' : ''}`} id="composer">
      <div className="composer-top">
        <div className="avatar avatar-blue" id="composerAvatar">
          {initials(user?.displayName || 'C')}
        </div>
        <button className="composer-prompt" id="focusPost" onClick={focusPost}>
          What&apos;s happening in your world?
        </button>
      </div>
      <form id="postForm" onSubmit={onSubmit}>
        <textarea
          id="postBody"
          ref={bodyRef}
          maxLength={2000}
          placeholder="Share something with your community..."
          rows={3}
        ></textarea>
        <div className="upload-preview" id="uploadPreview">
          {preview &&
            (preview.isVideo ? (
              <video src={preview.url} controls></video>
            ) : (
              <img src={preview.url} alt="Upload preview" />
            ))}
        </div>
        <div className="composer-bottom">
          <div className="composer-tools">
            <label className="tool-btn" htmlFor="mediaInput">
              <span className="tool-icon green">▧</span> Photo / video
            </label>
            <input
              id="mediaInput"
              ref={mediaRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
              hidden
              onChange={onMediaChange}
            />
            <button
              type="button"
              className="tool-btn"
              id="feelingBtn"
              onClick={() => toast('Feeling tags are coming soon.')}
            >
              <span className="tool-icon orange">☺</span> Feeling
            </button>
            <label className="download-toggle">
              <input type="checkbox" id="allowDownload" ref={downloadRef} /> Allow video downloads
            </label>
          </div>
          <button className="btn btn-primary" type="submit" id="publishBtn" disabled={publishing}>
            Publish <span>↗</span>
          </button>
        </div>
      </form>
    </section>
  );
}
