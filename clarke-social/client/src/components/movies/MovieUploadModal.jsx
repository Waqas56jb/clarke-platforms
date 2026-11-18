import { useState } from 'react';
import { AlertCircle, Upload } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { uploadMovie } from '../../services/moviesService';
import UploadProgress, { useUploadTask } from '../ui/UploadProgress';
import Dialog from '../ui/Dialog';
import { GENRES } from './genres';

function Field({ id, label, hint, children, wide }) {
  return (
    <div className={`field${wide ? ' field-wide' : ''}`}>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  );
}

// Creator studio: owners upload a film with optional poster and trailer.
export default function MovieUploadModal({ onClose, onUploaded }) {
  const toast = useToast();
  const upload = useUploadTask();
  const [access, setAccess] = useState('free');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    const f = e.currentTarget.elements;
    setError('');
    try {
      await upload.run((options) =>
        uploadMovie(
          {
            title: f.title.value,
            genre: f.genre.value,
            access,
            price: access === 'free' ? '0' : f.price.value,
            label: f.label.value,
            description: f.description.value,
            declaration: f.declaration.checked ? 'true' : 'false',
          },
          { poster: f.poster.files[0], trailer: f.trailer.files[0], video: f.video.files[0] },
          options
        )
      );
      onUploaded();
    } catch (err) {
      if (err.code === 'UPLOAD_CANCELLED') toast('Upload cancelled.', 'info');
      else setError(err.message || 'Upload failed. Please try again.');
    }
  };

  return (
    <Dialog
      title="Creator studio"
      onClose={onClose}
      size="lg"
      dismissible={!upload.busy}
      footer={
        upload.busy ? (
          <UploadProgress
            label="Uploading film. Keep this window open."
            progress={upload.progress}
            onCancel={upload.cancel}
          />
        ) : (
          <>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" form="movieUploadForm">
              <Upload size={20} aria-hidden="true" />
              Publish film
            </button>
          </>
        )
      }
    >
      <form id="movieUploadForm" className="stack" onSubmit={onSubmit}>
        <p className="text-muted">Publish a film you own or are licensed to distribute.</p>
        <fieldset className="movie-upload-grid" disabled={upload.busy}>
          <Field id="movieTitle" label="Title" wide>
            <input id="movieTitle" name="title" required maxLength={120} />
          </Field>
          <Field id="movieUploadGenre" label="Genre">
            <select id="movieUploadGenre" name="genre" required defaultValue="Drama">
              {GENRES.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </Field>
          <Field id="movieAccess" label="How members watch">
            <select id="movieAccess" value={access} onChange={(e) => setAccess(e.target.value)}>
              <option value="free">Free to watch</option>
              <option value="rent">Rent</option>
              <option value="original">Clarke Original (rent)</option>
            </select>
          </Field>
          {access !== 'free' && (
            <Field id="moviePrice" label="Rental price (USD, 48 hours)">
              <input
                id="moviePrice"
                name="price"
                type="number"
                min="0.5"
                max="1000"
                step="0.01"
                required
                defaultValue="2.99"
              />
            </Field>
          )}
          <Field id="movieLabel" label="Label (optional)" hint="For example, New release">
            <input id="movieLabel" name="label" maxLength={40} />
          </Field>
          <Field id="movieDescription" label="Description" wide>
            <textarea id="movieDescription" name="description" maxLength={600} rows={3} />
          </Field>
          <Field id="moviePoster" label="Poster image (optional)" hint="JPG, PNG, WebP or GIF">
            <input id="moviePoster" name="poster" type="file" accept="image/jpeg,image/png,image/webp,image/gif" />
          </Field>
          <Field id="movieTrailer" label="Trailer (optional)" hint="MP4, WebM or MOV">
            <input id="movieTrailer" name="trailer" type="file" accept="video/mp4,video/webm,video/quicktime" />
          </Field>
          <Field id="movieVideo" label="Film video file" hint="MP4, WebM or MOV" wide>
            <input id="movieVideo" name="video" type="file" accept="video/mp4,video/webm,video/quicktime" required />
          </Field>
          <label className="check-row field-wide">
            <input name="declaration" type="checkbox" required />
            <span>I own this film or hold the rights to stream and rent it on Clarke.</span>
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
      </form>
    </Dialog>
  );
}
