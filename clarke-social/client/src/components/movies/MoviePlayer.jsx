import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { rateMovie } from '../../services/moviesService';
import { mediaUrl } from '../../services/http';
import { ErrorState } from '../StateView';
import Dialog from '../ui/Dialog';

// Player for trailers and full films (films use a signed, time-limited link). Native controls provide
// play/pause, seeking, time, volume and fullscreen.
export default function MoviePlayer({ movie, src, kind, onClose, onRated }) {
  const toast = useToast();
  const [score, setScore] = useState(movie.myRating || '');
  const [failed, setFailed] = useState(false);

  const rate = async (value) => {
    setScore(value);
    try {
      const { movie: updated } = await rateMovie(movie.id, Number(value));
      onRated(updated);
      toast('Thanks for rating this film.', 'success');
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  return (
    <Dialog
      title={kind === 'trailer' ? `${movie.title}: trailer` : movie.title}
      onClose={onClose}
      size="xl"
      fullOnMobile
      className="player-modal"
    >
      <div className="stack">
        <div className="movie-video">
          {failed ? (
            <ErrorState plain title="This video couldn't be played." message="Please try again later." />
          ) : (
            <video src={mediaUrl(src)} controls autoPlay playsInline onError={() => setFailed(true)} />
          )}
        </div>
        {movie.description && <p className="movie-description">{movie.description}</p>}
        {kind === 'film' && (
          <div className="field movie-rate">
            <label className="field-label" htmlFor="movieRating">
              Your rating
            </label>
            <select id="movieRating" value={score} onChange={(e) => rate(e.target.value)}>
              <option value="" disabled>
                Rate 1–10
              </option>
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </Dialog>
  );
}
