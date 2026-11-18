const ART = ['☀', '✦', '♫', '◈'];

export default function TrackRow({
  track: t,
  index,
  playing,
  playlists,
  mine,
  onPlay,
  onLike,
  onAdd,
  onDelete,
  onReport,
}) {
  return (
    <div className={`music-track${playing ? ' playing' : ''}`}>
      <div className="music-art">{ART[index % ART.length]}</div>
      <div className="music-track-info">
        <b>{t.title}</b>
        <small>
          {t.artist} · {t.rightsCategory === 'original' ? 'Original' : 'Licensed'} · ♥ {t.likes}
        </small>
      </div>
      <div className="track-actions">
        <button onClick={onPlay}>{playing ? 'Playing' : 'Play'}</button>
        <button onClick={onLike} title={t.liked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}>
          {t.liked ? '♥' : '♡'}
        </button>
        {playlists.length > 0 && (
          <select
            aria-label="Add to playlist"
            value=""
            onChange={(e) => e.target.value && onAdd(Number(e.target.value))}
          >
            <option value="">+ Playlist</option>
            {playlists.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
        {mine ? (
          <button onClick={onDelete} title="Delete track">
            ✕
          </button>
        ) : (
          <button onClick={onReport} title="Report track">
            ⚑
          </button>
        )}
      </div>
    </div>
  );
}
