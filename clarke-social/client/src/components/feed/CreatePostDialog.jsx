import { useRef, useState } from 'react';
import { ImagePlus, Smile, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { createMediaPost, createTextPost } from '../../services/postsService';
import Avatar from '../Avatar';
import { useConfirm } from '../ui/ConfirmDialog';
import Dialog from '../ui/Dialog';
import { FEELINGS } from './feelings';
import { MEDIA_ACCEPT, releaseMedia, toMedia } from './mediaFile';
import UploadProgress from './UploadProgress';
import { useUpload } from './useUpload';

const MAX_LENGTH = 2000;

// New post: text, one photo or video, a feeling and (for videos) download permission. Opened by
// openCreate(); a bottom sheet on phones and a 640px dialog on larger screens.
export default function CreatePostDialog() {
  const { user } = useAuth();
  const { closeCreate, bumpFeed } = useNavigation();
  const { confirm } = useConfirm();
  const toast = useToast();
  const upload = useUpload();
  const fileRef = useRef(null);
  const [body, setBody] = useState('');
  const [media, setMedia] = useState(null);
  const [feeling, setFeeling] = useState('');
  const [picking, setPicking] = useState(false);
  const [allowDownload, setAllowDownload] = useState(false);
  const canPublish = Boolean(body.trim() || media) && !upload.uploading;

  const chooseFile = (file) => {
    releaseMedia(media);
    setMedia(toMedia(file));
    if (fileRef.current) fileRef.current.value = '';
  };

  const close = async () => {
    if (body.trim() || media) {
      const discard = await confirm({
        title: 'Discard this post?',
        message: upload.uploading ? 'Your upload will be cancelled.' : 'What you have written will be lost.',
        confirmLabel: 'Discard',
        danger: true,
      });
      if (!discard) return;
    }
    upload.cancel();
    releaseMedia(media);
    closeCreate();
  };

  const publish = async (e) => {
    e?.preventDefault();
    if (!canPublish) return;
    const result = await upload.run((options) =>
      media
        ? createMediaPost(
            { body, feeling, allowDownload: media.isVideo && allowDownload ? 'true' : 'false' },
            media.file,
            options
          )
        : createTextPost({ body, feeling })
    );
    if (!result) return;
    releaseMedia(media);
    toast('Your post is live on Clarke.', 'success');
    closeCreate();
    bumpFeed();
  };

  return (
    <Dialog title="Create post" onClose={close} size="lg" className="create-post-dialog">
      <form id="postForm" className="stack" onSubmit={publish}>
        <div className="create-post-author">
          <Avatar src={user?.avatar} name={user?.displayName} size="md" />
          <div className="grow">
            <p className="list-row-title">{user?.displayName}</p>
            {feeling && <p className="list-row-sub">is feeling {feeling}</p>}
          </div>
        </div>
        <div className="field">
          <label className="sr-only" htmlFor="postBody">
            Post text
          </label>
          <textarea
            id="postBody"
            className="create-post-text"
            value={body}
            maxLength={MAX_LENGTH}
            rows={4}
            placeholder="What's happening?"
            onChange={(e) => setBody(e.target.value)}
            disabled={upload.uploading}
            data-autofocus
          />
          {body.length > MAX_LENGTH - 200 && (
            <span className="field-hint">
              {body.length} / {MAX_LENGTH}
            </span>
          )}
        </div>

        {media && (
          <div className="create-post-preview">
            {media.isVideo ? (
              <video src={media.url} controls playsInline preload="metadata" />
            ) : (
              <img src={media.url} alt="Selected photo preview" />
            )}
            <button
              type="button"
              className="icon-btn create-post-remove"
              aria-label="Remove photo or video"
              onClick={() => chooseFile(null)}
              disabled={upload.uploading}
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        )}

        <div className="create-post-tools">
          <span className="caption">Add to your post</span>
          <input
            id="mediaInput"
            ref={fileRef}
            type="file"
            accept={MEDIA_ACCEPT}
            className="sr-only"
            disabled={upload.uploading}
            onChange={(e) => chooseFile(e.target.files[0])}
          />
          <label className="btn btn-ghost btn-sm" htmlFor="mediaInput" aria-disabled={upload.uploading || undefined}>
            <ImagePlus size={20} aria-hidden="true" className="composer-icon-media" />
            {media ? 'Change photo/video' : 'Photo/Video'}
          </label>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            id="feelingBtn"
            aria-expanded={picking}
            aria-controls="feelingMenu"
            onClick={() => setPicking((p) => !p)}
          >
            <Smile size={20} aria-hidden="true" className="composer-icon-feeling" />
            Feeling
          </button>
        </div>
        {picking && (
          <div className="feeling-menu" id="feelingMenu" role="group" aria-label="Choose a feeling">
            {FEELINGS.map((f) => (
              <button
                type="button"
                key={f}
                className="chip"
                aria-pressed={f === feeling}
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
        <label className="check-row">
          <input
            type="checkbox"
            id="allowDownload"
            checked={allowDownload}
            onChange={(e) => setAllowDownload(e.target.checked)}
          />
          <span>
            Allow video downloads
            <span className="field-hint"> — lets people save your video. Applies to videos only.</span>
          </span>
        </label>

        <UploadProgress upload={upload} showProgress={Boolean(media)} onRetry={publish} />

        <div className="create-post-foot">
          <button type="submit" className="btn btn-primary" id="publishBtn" disabled={!canPublish}>
            {upload.uploading && <span className="spinner" aria-hidden="true" />}
            {upload.uploading ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
