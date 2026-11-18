// Clarke Music: member-uploaded catalogue, likes, playlists and a queue-based player.
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import MusicUploadForm from '../components/music/MusicUploadForm';
import NowPlaying from '../components/music/NowPlaying';
import TrackRow from '../components/music/TrackRow';
import { ErrorState, Loading } from '../components/StateView';
import { useAsync } from '../hooks/useAsync';
import {
  addToPlaylist,
  createPlaylist,
  deleteTrack,
  listPlaylists,
  listTracks,
  reportTrack,
  toggleTrackLike,
} from '../services/musicService';

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

export default function MusicPage() {
  const { user } = useAuth();
  const { openAuth } = useNavigation();
  const toast = useToast();
  const tracks = useAsync(() => listTracks().then((d) => d.tracks), [user?.id]);
  const playlists = useAsync(() => (user ? listPlaylists().then((d) => d.playlists) : Promise.resolve([])), [user?.id]);
  const [queue, setQueue] = useState({ ids: [], index: 0 });

  const all = tracks.data || [];
  const byId = new Map(all.map((t) => [t.id, t]));
  const queueTracks = queue.ids.map((id) => byId.get(id)).filter(Boolean);
  const current = queueTracks[queue.index];

  const playList = (list, startId) =>
    list.length &&
    setQueue({
      ids: list.map((t) => t.id),
      index: Math.max(
        0,
        list.findIndex((t) => t.id === startId)
      ),
    });

  const signedIn =
    (fn) =>
    async (...args) => {
      if (!user) return openAuth();
      try {
        await fn(...args);
      } catch (e) {
        toast(e.message);
      }
    };

  const like = signedIn(async (t) => {
    const { liked } = await toggleTrackLike(t.id);
    tracks.setData((list) => list.map((x) => (x.id === t.id ? { ...x, liked, likes: x.likes + (liked ? 1 : -1) } : x)));
  });
  const add = signedIn(async (playlistId, t) => {
    await addToPlaylist(playlistId, t.id);
    playlists.reload();
    toast('Added to your playlist.');
  });
  const remove = signedIn(async (t) => {
    if (!window.confirm(`Delete “${t.title}”?`)) return;
    await deleteTrack(t.id);
    tracks.reload();
  });
  const report = signedIn(async (t) => {
    const reason = window.prompt('Why are you reporting this track?');
    if (!reason) return;
    await reportTrack(t.id, reason);
    toast('Thank you. Your report has been submitted for review.');
  });
  const newPlaylist = signedIn(async () => {
    const name = window.prompt('Name your playlist');
    if (!name?.trim()) return;
    await createPlaylist(name.trim());
    playlists.reload();
    toast(`Playlist “${name.trim()}” created.`);
  });

  const liked = all.filter((t) => t.liked);
  const library = [
    { key: 'liked', name: 'Liked Songs', meta: `${liked.length} tracks`, list: liked },
    ...(playlists.data || []).map((p, i) => ({
      key: p.id,
      name: p.name,
      meta: `Playlist · ${p.trackIds.length} tracks`,
      list: p.trackIds.map((id) => byId.get(id)).filter(Boolean),
      style: {
        background: ['linear-gradient(135deg,#5d2d65,#d58ac0)', 'linear-gradient(135deg,#145b4b,#79c9a6)'][i % 2],
      },
    })),
  ];

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
                <small>Newest tracks from Clarke artists</small>
              </div>
              <span className="music-chip">DISCOVER</span>
            </div>
            {tracks.loading && !tracks.data && <Loading text="Loading tracks…" />}
            {tracks.error && <ErrorState message={tracks.error} onRetry={tracks.reload} />}
            {tracks.data?.length === 0 && (
              <p className="music-status">No tracks have been published yet. Upload the first one below.</p>
            )}
            {all.map((t, i) => (
              <TrackRow
                key={t.id}
                track={t}
                index={i}
                playing={current?.id === t.id}
                playlists={playlists.data || []}
                mine={t.ownerId === user?.id}
                onPlay={() => playList(all, t.id)}
                onLike={() => like(t)}
                onAdd={(pid) => add(pid, t)}
                onDelete={() => remove(t)}
                onReport={() => report(t)}
              />
            ))}
          </div>
          <MusicUploadForm onUploaded={tracks.reload} />
          <div className="music-panel" style={{ marginTop: 16 }}>
            <div className="music-heading">
              <div>
                <h3>Your library</h3>
                <small>Liked songs and your playlists</small>
              </div>
              <button className="text-btn" id="createPlaylist" onClick={newPlaylist}>
                ＋ New playlist
              </button>
            </div>
            {!user && <p className="music-status">Sign in to build your library.</p>}
            {playlists.error && <p className="inline-error">{playlists.error}</p>}
            {user && (
              <div className="music-collection">
                {library.map((a) => (
                  <button
                    className="music-album"
                    key={a.key}
                    style={{ textAlign: 'left', cursor: 'pointer' }}
                    onClick={() => (a.list.length ? playList(a.list) : toast('This collection is empty.'))}
                  >
                    <div className="music-album-art" style={a.style}>
                      ♫
                    </div>
                    <b>{a.name}</b>
                    <small>{a.meta}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
        <aside>
          <NowPlaying
            queue={queueTracks}
            index={queue.index}
            onIndexChange={(index) => setQueue((q) => ({ ...q, index }))}
          />
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
