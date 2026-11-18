import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { createStory } from '../../services/storiesService';
import Dialog from '../ui/Dialog';
import UploadProgress from './UploadProgress';
import { useUpload } from './useUpload';

// Preview of the picked photo/video with an optional caption, then upload with progress.
export default function StoryUploadDialog({ media, onClose, onShared }) {
  const toast = useToast();
  const upload = useUpload();
  const [caption, setCaption] = useState('');

  const share = async (e) => {
    e?.preventDefault();
    if (upload.uploading) return;
    const result = await upload.run((options) => createStory(caption, media.file, options));
    if (!result) return;
    toast('Your story is live for 24 hours.', 'success');
    onShared();
  };

  const close = () => {
    upload.cancel();
    onClose();
  };

  return (
    <Dialog
      title="Share to your story"
      onClose={close}
      className="story-upload-dialog"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={close}>
            Cancel
          </button>
          <button type="submit" form="storyForm" className="btn btn-primary" disabled={upload.uploading}>
            {upload.uploading && <span className="spinner" aria-hidden="true" />}
            {upload.uploading ? 'Sharing…' : 'Share'}
          </button>
        </>
      }
    >
      <form id="storyForm" className="stack" onSubmit={share}>
        <div className="story-upload-preview">
          {media.isVideo ? (
            <video src={media.url} controls playsInline preload="metadata" />
          ) : (
            <img src={media.url} alt="Story preview" />
          )}
        </div>
        <label className="field">
          <span className="field-label">Caption (optional)</span>
          <input
            value={caption}
            maxLength={200}
            onChange={(e) => setCaption(e.target.value)}
            disabled={upload.uploading}
            data-autofocus
          />
        </label>
        <p className="field-hint">Stories disappear automatically after 24 hours.</p>
        <UploadProgress upload={upload} onRetry={share} />
      </form>
    </Dialog>
  );
}
