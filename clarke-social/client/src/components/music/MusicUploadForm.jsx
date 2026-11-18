import { useState } from 'react';
import { AlertCircle, Lock, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { uploadTrack } from '../../services/musicService';
import UploadProgress, { useUploadTask } from '../ui/UploadProgress';

export default function MusicUploadForm({ onUploaded }) {
  const { user } = useAuth();
  const { openAuth } = useNavigation();
  const toast = useToast();
  const upload = useUploadTask();
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user) return openAuth();
    const form = e.currentTarget;
    const el = form.elements;
    setError('');
    try {
      await upload.run((options) =>
        uploadTrack(
          {
            title: el.musicTitle.value,
            artist: el.musicArtist.value,
            rights: el.musicRights.value,
            declaration: el.musicDeclaration.checked ? 'true' : 'false',
          },
          el.musicAudio.files[0],
          el.musicProof.files[0],
          options
        )
      );
      form.reset();
      toast('Your track is published in Clarke Music.', 'success');
      onUploaded();
    } catch (err) {
      if (err.code === 'UPLOAD_CANCELLED') toast('Upload cancelled.', 'info');
      else setError(err.message || 'Upload failed. Please try again.');
    }
  };

  return (
    <section className="card card-pad-lg music-upload" aria-labelledby="musicUploadTitle">
      <div className="card-head">
        <div>
          <h2 className="card-title" id="musicUploadTitle">
            Upload your music
          </h2>
          <p>Publish original or licensed tracks to Clarke Music.</p>
        </div>
      </div>
      <form id="musicUploadForm" className="stack" onSubmit={onSubmit}>
        <fieldset className="music-upload-fields" disabled={upload.busy}>
          <div className="field-row">
            <div className="field">
              <label className="field-label" htmlFor="musicTitle">
                Track title
              </label>
              <input id="musicTitle" required maxLength={120} />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="musicArtist">
                Artist / rights holder
              </label>
              <input id="musicArtist" required maxLength={120} />
            </div>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="musicRights">
              Rights category
            </label>
            <select id="musicRights" required defaultValue="">
              <option value="">Choose rights category</option>
              <option value="original">100% original music I created and control</option>
              <option value="licensed">Licensed recording with distribution and streaming permission</option>
            </select>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="field-label" htmlFor="musicAudio">
                Audio file
              </label>
              <input
                id="musicAudio"
                type="file"
                accept="audio/mpeg,audio/mp3,audio/wav,audio/flac,audio/aac,audio/ogg,audio/mp4"
                required
              />
              <span className="field-hint">MP3, WAV, FLAC, AAC, OGG or M4A.</span>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="musicProof">
                Licence or ownership evidence (optional)
              </label>
              <input id="musicProof" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx" />
              <span className="field-hint">PDF, image or agreement.</span>
            </div>
          </div>
          <p className="notice">
            <Lock size={18} aria-hidden="true" />
            <span>
              Evidence files are kept private and are only used if a track&apos;s rights are questioned. A licence to
              use a beat or sample may not grant every right needed for streaming, downloads, videos or monetisation.
            </span>
          </p>
          <label className="check-row">
            <input type="checkbox" id="musicDeclaration" required />
            <span>
              I confirm I own the music or hold all permissions required to upload, stream, distribute and monetise this
              recording on Clarke. I understand tracks can be reported and will be removed if rights cannot be verified.
            </span>
          </label>
        </fieldset>
        <div role="alert">
          {error && (
            <p className="notice notice-error">
              <AlertCircle size={18} aria-hidden="true" />
              <span>{error}</span>
            </p>
          )}
        </div>
        {upload.busy ? (
          <UploadProgress label="Uploading track" progress={upload.progress} onCancel={upload.cancel} />
        ) : (
          <div>
            <button className="btn btn-primary" type="submit">
              <Upload size={20} aria-hidden="true" />
              Publish track
            </button>
          </div>
        )}
      </form>
    </section>
  );
}
