// Clarke Music: member-uploaded catalogue, likes, playlists and a queue-based player.
import { useCallback, useRef, useState } from 'react';
import { Music } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import MiniPlayer from '../components/music/MiniPlayer';
import MusicLibrary from '../components/music/MusicLibrary';
import MusicUploadForm from '../components/music/MusicUploadForm';
import NowPlaying from '../components/music/NowPlaying';
import TrackRow from '../components/music/TrackRow';
import { useMusicPlayer } from '../components/music/useMusicPlayer';
import { EmptyState, ErrorState, Loading } from '../components/StateView';
import { useConfirm, useReport } from '../components/ui/ConfirmDialog';
import { useAsync } from '../hooks/useAsync';
import { MOBILE_QUERY, useMediaQuery } from '../hooks/useMediaQuery';
import {
  addToPlaylist,
  createPlaylist,
  deleteTrack,
  listPlaylists,
  listTracks,
  reportTrack,
  toggleTrackLike,
} from '../services/musicService';

const plural = (n) => `${n} ${n === 1 ? 'track' : 'tracks'}`;

export default function MusicPage() {
  const { user } = useAuth();
  const { openAuth } = useNavigation();
  const toast = useToast();
  const { confirm, prompt } = useConfirm();
  const report = useReport();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const playerRef = useRef(null);
  const tracks = useAsync(() => listTracks().then((d) => d.tracks), [user?.id]);
  const playlists = useAsync(() => (user ? listPlaylists().then((d) => d.playlists) : Promise.resolve([])), [user?.id]);
  const [queue, setQueue] = useState({ ids: [], index: 0 });

  const all = tracks.data || [];
  const byId = new Map(all.map((t) => [t.id, t]));
  const queueTracks = queue.ids.map((id) => byId.get(id)).filter(Boolean);
  const setIndex = useCallback((index) => setQueue((q) => ({ ...q, index })), []);
  const player = useMusicPlayer(queueTracks, queue.index, setIndex);
  const current = player.track;

  const playList = (list, startId) => {
    if (!list.length) return;
    setQueue({
      ids: list.map((t) => t.id),
      index: Math.max(
        0,
        list.findIndex((t) => t.id === startId)
      ),
    });
  };

  const signedIn =
    (fn) =>
    async (...args) => {
      if (!user) return openAuth();
      try {
        await fn(...args);
      } catch (e) {
        toast(e.message, 'error');
      }
    };

  const setLike = (id, liked) =>
    tracks.setData((list) =>
      list.map((x) => (x.id === id && x.liked !== liked ? { ...x, liked, likes: x.likes + (liked ? 1 : -1) } : x))
    );

  // Optimistic: flip at once, then settle on the server's answer (or roll back on error).
  const like = signedIn(async (t) => {
    setLike(t.id, !t.liked);
    try {
      const { liked } = await toggleTrackLike(t.id);
      setLike(t.id, liked);
    } catch (e) {
      setLike(t.id, t.liked);
      throw e;
    }
  });
  const add = signedIn(async (playlistId, t) => {
    await addToPlaylist(playlistId, t.id);
    playlists.reload();
    toast('Added to your playlist.', 'success');
  });
  const remove = signedIn(async (t) => {
    const ok = await confirm({
      title: 'Delete this track?',
      message: `“${t.title}” will be removed from Clarke Music for everyone.`,
      confirmLabel: 'Delete track',
      danger: true,
    });
    if (!ok) return;
    await deleteTrack(t.id);
    tracks.reload();
    toast('Track deleted.', 'success');
  });
  const flag = signedIn(async (t) => {
    const reason = await report('track');
    if (!reason) return;
    await reportTrack(t.id, reason);
    toast('Thank you. Your report has been submitted for review.', 'success');
  });
  const newPlaylist = signedIn(async () => {
    const name = await prompt({
      title: 'New playlist',
      label: 'Playlist name',
      placeholder: 'My playlist',
      confirmLabel: 'Create playlist',
      maxLength: 80,
    });
    if (!name) return;
    await createPlaylist(name);
    playlists.reload();
    toast(`Playlist “${name}” created.`, 'success');
  });

  const onPlayTrack = (t) => (current?.id === t.id ? player.toggle() : playList(all, t.id));

  const liked = all.filter((t) => t.liked);
  const collections = [
    { key: 'liked', name: 'Liked Songs', meta: plural(liked.length), list: liked },
    ...(playlists.data || []).map((p) => ({
      key: p.id,
      name: p.name,
      meta: `Playlist · ${plural(p.trackIds.length)}`,
      list: p.trackIds.map((id) => byId.get(id)).filter(Boolean),
    })),
  ];

  let catalogue;
  if (tracks.loading && !tracks.data) catalogue = <Loading variant="track" count={5} text="Loading tracks" />;
  else if (tracks.error && !tracks.data)
    catalogue = <ErrorState plain title="Couldn't load music" message={tracks.error} onRetry={tracks.reload} />;
  else if (!all.length)
    catalogue = (
      <EmptyState plain icon={Music} title="No music available right now.">
        Tracks published by Clarke artists will appear here.
      </EmptyState>
    );
  else
    catalogue = (
      <ul className="music-track-list">
        {all.map((t) => (
          <TrackRow
            key={t.id}
            track={t}
            current={current?.id === t.id}
            playing={current?.id === t.id && player.playing}
            playlists={playlists.data || []}
            mine={t.ownerId === user?.id}
            onPlay={() => onPlayTrack(t)}
            onLike={() => like(t)}
            onAdd={(pid) => add(pid, t)}
            onDelete={() => remove(t)}
            onReport={() => flag(t)}
          />
        ))}
      </ul>
    );

  const showMini = isMobile && Boolean(current);
  return (
    <div className={`music-page${showMini ? ' has-mini' : ''}`}>
      <header className="page-header">
        <div>
          <h1>Clarke Music</h1>
          <p>Independent tracks from Clarke artists. Original and licensed music only.</p>
        </div>
      </header>
      <div className="music-layout">
        <section className="card card-pad-lg music-panel" aria-labelledby="musicTracksTitle">
          <div className="card-head">
            <div>
              <h2 className="card-title" id="musicTracksTitle">
                Latest tracks
              </h2>
              <p>Newest uploads from Clarke artists</p>
            </div>
          </div>
          {catalogue}
        </section>
        <aside className="music-side" ref={playerRef} aria-label="Player">
          <NowPlaying player={player} />
        </aside>
        <MusicLibrary
          signedIn={Boolean(user)}
          collections={collections}
          error={playlists.error}
          onCreate={newPlaylist}
          onPlay={(list) => playList(list)}
          onSignIn={() => openAuth()}
        />
        <MusicUploadForm onUploaded={tracks.reload} />
      </div>
      {showMini && (
        <MiniPlayer
          player={player}
          onOpen={() => playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
        />
      )}
    </div>
  );
}
