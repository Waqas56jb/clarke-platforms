// Clarke Music demo from the Movies preview. Local audition only; nothing is uploaded or stored.
import { useState } from 'react';
import MusicUploadForm from '../components/music/MusicUploadForm';
import NowPlaying from '../components/music/NowPlaying';

const TRACKS = [
  ['☀', 'Island Mornings', 'Clarke editorial · Chill'],
  ['✦', 'Fresh Frequencies', 'Independent artists · New releases'],
  ['♫', 'Acoustic Sessions', 'Original recordings · Acoustic'],
  ['◈', 'Late Night Focus', 'Licensed catalogue · Instrumental'],
];

const ALBUMS = [
  { art: '♫', title: 'Liked Songs', meta: 'Your favourites' },
  {
    art: '◉',
    title: 'Grenada Sessions',
    meta: 'Playlist · 12 tracks',
    style: { background: 'linear-gradient(135deg,#5d2d65,#d58ac0)' },
  },
  {
    art: '✧',
    title: 'New Discoveries',
    meta: 'Playlist · Updated weekly',
    style: { background: 'linear-gradient(135deg,#145b4b,#79c9a6)' },
  },
];

const FEATURES = [
  'Gapless playback and crossfade',
  'Queue and play-next controls',
  'Lyrics and synced captions (where licensed)',
  'High-quality audio and device handoff',
  'Artist pages, credits and release notes',
  'Personalised mixes and smart recommendations',
  'Downloads only where the licence permits',
  'Family profiles, explicit-content controls and privacy settings',
];

function createPlaylist() {
  const n = prompt('Name your playlist');
  if (n && n.trim())
    alert(`Playlist “${n.trim()}” is a preview action. Playlist saving requires the connected account backend.`);
}

export default function MusicPage() {
  const [track, setTrack] = useState(null);
  return (
    <>
      <section className="music-hero">
        <div>
          <span className="eyebrow">CLARKE MUSIC · LISTEN YOUR WAY</span>
          <h2>A richer home for music.</h2>
          <p>
            Discover independent artists, build your library, create playlists and enjoy a clean, immersive listening
            experience across your devices.
          </p>
          <span className="music-chip">ORIGINAL &amp; LICENSED MUSIC ONLY</span>
        </div>
        <div style={{ fontSize: 78, filter: 'drop-shadow(0 12px 20px #0008)' }}>♫</div>
      </section>
      <div className="music-layout">
        <section>
          <div className="music-panel">
            <div className="music-heading">
              <div>
                <h3>Made for your day</h3>
                <small>Curated Clarke collections</small>
              </div>
              <span className="music-chip">DISCOVER</span>
            </div>
            {TRACKS.map(([art, title, meta]) => (
              <div className="music-track" key={title}>
                <div className="music-art">{art}</div>
                <div className="music-track-info">
                  <b>{title}</b>
                  <small>{meta}</small>
                </div>
                <button
                  onClick={() =>
                    alert('This is a sample playlist card. Add approved catalogue recordings to enable streaming.')
                  }
                >
                  Play
                </button>
              </div>
            ))}
          </div>
          <MusicUploadForm onAudition={setTrack} />
          <div className="music-panel" style={{ marginTop: 16 }}>
            <div className="music-heading">
              <div>
                <h3>Your library</h3>
                <small>Albums, playlists and saved tracks</small>
              </div>
              <button className="text-btn" id="createPlaylist" onClick={createPlaylist}>
                ＋ New playlist
              </button>
            </div>
            <div className="music-collection">
              {ALBUMS.map((a) => (
                <div className="music-album" key={a.title}>
                  <div className="music-album-art" style={a.style}>
                    {a.art}
                  </div>
                  <b>{a.title}</b>
                  <small>{a.meta}</small>
                </div>
              ))}
            </div>
          </div>
        </section>
        <aside>
          <NowPlaying track={track} />
          <section className="music-panel" style={{ marginTop: 15 }}>
            <div className="music-heading">
              <h3>Listening features</h3>
            </div>
            <p className="music-status">
              {FEATURES.map((f, i) => (
                <span key={f}>
                  • {f}
                  {i < FEATURES.length - 1 && <br />}
                </span>
              ))}
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
