import { useState } from 'react';
import { uploadMovie } from '../../services/moviesService';

const GENRES = ['Action', 'Comedy', 'Drama', 'Documentary', 'Family', 'Sci-Fi'];

// Creator studio: owners upload a film with optional poster and trailer.
export default function MovieUploadModal({ onClose, onUploaded }) {
  const [access, setAccess] = useState('free');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    const f = e.currentTarget.elements;
    setError('');
    setBusy(true);
    try {
      await uploadMovie(
        {
          title: f.title.value,
          genre: f.genre.value,
          access,
          price: access === 'free' ? '0' : f.price.value,
          label: f.label.value,
          description: f.description.value,
          declaration: f.declaration.checked ? 'true' : 'false',
        },
        { poster: f.poster.files[0], trailer: f.trailer.files[0], video: f.video.files[0] }
      );
      onUploaded();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <section className="modal" style={{ width: 'min(620px,100%)', maxHeight: '92vh', overflow: 'auto' }}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2>Creator studio</h2>
        <p className="dating-muted">Publish a film you own or are licensed to distribute.</p>
        <form onSubmit={onSubmit}>
          <div className="dating-form-grid">
            <label className="wide">
              Title
              <input name="title" required maxLength={120} />
            </label>
            <label>
              Genre
              <select name="genre" required defaultValue="Drama">
                {GENRES.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </label>
            <label>
              How members watch
              <select value={access} onChange={(e) => setAccess(e.target.value)}>
                <option value="free">Free to watch</option>
                <option value="rent">Rent</option>
                <option value="original">Clarke Original (rent)</option>
              </select>
            </label>
            {access !== 'free' && (
              <label>
                Rental price (USD, 48 hours)
                <input name="price" type="number" min="0.5" max="1000" step="0.01" required defaultValue="2.99" />
              </label>
            )}
            <label>
              Label (e.g. New release)
              <input name="label" maxLength={40} />
            </label>
            <label className="wide">
              Description
              <textarea name="description" maxLength={600} rows={3}></textarea>
            </label>
            <label>
              Poster image
              <input name="poster" type="file" accept="image/jpeg,image/png,image/webp,image/gif" />
            </label>
            <label>
              Trailer (optional)
              <input name="trailer" type="file" accept="video/mp4,video/webm,video/quicktime" />
            </label>
            <label className="wide">
              Film video file
              <input name="video" type="file" accept="video/mp4,video/webm,video/quicktime" required />
            </label>
            <label className="wide rights-check" style={{ display: 'flex', gap: 8 }}>
              <input name="declaration" type="checkbox" required style={{ width: 'auto' }} />
              <span>I own this film or hold the rights to stream and rent it on Clarke.</span>
            </label>
          </div>
          {error && <p className="inline-error">{error}</p>}
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Uploading… keep this window open' : 'Publish film'}
          </button>
        </form>
      </section>
    </div>
  );
}
