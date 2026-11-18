import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { rateMovie } from '../../services/moviesService';
import { mediaUrl } from '../../services/http';

// Modal player for trailers and full films (films use a signed, time-limited link).
export default function MoviePlayer({ movie, src, kind, onClose, onRated }) {
  const toast = useToast();
  const [score, setScore] = useState(movie.myRating || '');

  const rate = async (value) => {
    setScore(value);
    try {
      const { movie: updated } = await rateMovie(movie.id, Number(value));
      onRated(updated);
      toast('Thanks for rating this film.');
    } catch (e) {
      toast(e.message);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="modal player-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2>
          {movie.title}
          {kind === 'trailer' ? ' — trailer' : ''}
        </h2>
        <video src={mediaUrl(src)} controls autoPlay playsInline />
        {movie.description && <p className="post-body">{movie.description}</p>}
        {kind === 'film' && (
          <label className="form-actions" style={{ fontSize: 12 }}>
            Your rating
            <select value={score} onChange={(e) => rate(e.target.value)}>
              <option value="" disabled>
                Rate 1–10
              </option>
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </label>
        )}
      </section>
    </div>
  );
}
