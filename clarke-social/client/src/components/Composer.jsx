import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { createMediaPost, createTextPost } from '../services/postsService';
import Avatar from './Avatar';

export const FEELINGS = [
  'happy',
  'grateful',
  'excited',
  'loved',
  'blessed',
  'relaxed',
  'tired',
  'sad',
  'proud',
  'motivated',
];

export default function Composer({ onPosted }) {
  const { user } = useAuth();
  const { openAuth } = useNavigation();
  const toast = useToast();
  const [expanded, setExpanded] = useState(false);
  const [preview, setPreview] = useState(null);
  const [feeling, setFeeling] = useState('');
  const [picking, setPicking] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const bodyRef = useRef(null);
  const mediaRef = useRef(null);
  const downloadRef = useRef(null);

  useEffect(() => () => preview && URL.revokeObjectURL(preview.url), [preview]);

  const onMediaChange = () => {
    const file = mediaRef.current.files[0];
    setPreview(file ? { url: URL.createObjectURL(file), isVideo: file.type.startsWith('video/') } : null);
    if (file) setExpanded(true);
  };

  const focusPost = () => {
    if (!user) return openAuth();
    setExpanded(true);
    setTimeout(() => bodyRef.current?.focus());
  };

  const reset = () => {
    bodyRef.current.value = '';
    mediaRef.current.value = '';
    downloadRef.current.checked = false;
    setPreview(null);
    setFeeling('');
    setPicking(false);
    setExpanded(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user) return openAuth();
    const file = mediaRef.current.files[0];
    const body = bodyRef.current.value;
    setPublishing(true);
    try {
      if (file)
        await createMediaPost({ body, feeling, allowDownload: downloadRef.current.checked ? 'true' : 'false' }, file);
      else await createTextPost({ body, feeling });
      reset();
      toast('Your post is live on Clarke.');
      onPosted?.();
    } catch (err) {
      toast(err.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <section className={`composer card-panel${expanded ? ' expanded' : ''}`} id="composer">
      <div className="composer-top">
        <Avatar src={user?.avatar} name={user?.displayName || 'C'} color="avatar-blue" />
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
        {feeling && <p className="post-feeling">Feeling {feeling}</p>}
        {picking && (
          <div className="feeling-menu">
            {FEELINGS.map((f) => (
              <button
                type="button"
                key={f}
                className={f === feeling ? 'active' : ''}
                onClick={() => {
                  setFeeling(f === feeling ? '' : f);
                  setPicking(false);
                }}
              >
                {f}
              </button>
            ))}
          </div>
        )}
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
            <button type="button" className="tool-btn" id="feelingBtn" onClick={() => setPicking((p) => !p)}>
              <span className="tool-icon orange">☺</span> Feeling
            </button>
            <label className="download-toggle">
              <input type="checkbox" id="allowDownload" ref={downloadRef} /> Allow video downloads
            </label>
          </div>
          <button className="btn btn-primary" type="submit" id="publishBtn" disabled={publishing}>
            {publishing ? 'Publishing…' : 'Publish'} <span>↗</span>
          </button>
        </div>
      </form>
    </section>
  );
}
