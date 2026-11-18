import { Heart, ListMusic, Plus } from 'lucide-react';
import { EmptyState } from '../StateView';

// "Your library": Liked Songs plus the member's playlists. Each collection plays as a queue.
export default function MusicLibrary({ signedIn, collections, error, onCreate, onPlay, onSignIn }) {
  return (
    <section className="card card-pad-lg music-library" aria-labelledby="musicLibraryTitle">
      <div className="card-head">
        <div>
          <h2 className="card-title" id="musicLibraryTitle">
            Your library
          </h2>
          <p>Liked songs and your playlists</p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" id="createPlaylist" onClick={onCreate}>
          <Plus size={16} aria-hidden="true" />
          New playlist
        </button>
      </div>
      {!signedIn ? (
        <EmptyState
          plain
          icon={ListMusic}
          title="Sign in to build your library."
          action={
            <button type="button" className="btn btn-primary" onClick={onSignIn}>
              Sign in
            </button>
          }
        />
      ) : (
        <>
          {error && <p className="inline-error">{error}</p>}
          <ul className="music-collection">
            {collections.map((c) => (
              <li key={c.key}>
                <button
                  type="button"
                  className="music-album"
                  onClick={() => onPlay(c.list)}
                  disabled={!c.list.length}
                  aria-label={`Play ${c.name}, ${c.meta}`}
                >
                  <span className={`music-album-art${c.key === 'liked' ? ' liked' : ''}`} aria-hidden="true">
                    {c.key === 'liked' ? <Heart size={24} fill="currentColor" /> : <ListMusic size={24} />}
                  </span>
                  <span className="music-album-name">{c.name}</span>
                  <span className="caption">{c.meta}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
