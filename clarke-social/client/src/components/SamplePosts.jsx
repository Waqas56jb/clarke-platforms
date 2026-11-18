// Sample cards shown in the Movies preview's home feed.
const SAMPLES = [
  {
    color: 'avatar-purple',
    letter: 'M',
    name: 'Maya Lewis',
    meta: '@mayacreates · 2 hours ago',
    title: 'Finding inspiration in the little things ✨',
    text: 'Sharing creativity, good energy and moments from the island. Welcome to Clarke!',
    likes: '♡ 128 likes',
    comments: '▤ 24 comments',
  },
  {
    color: 'avatar-orange',
    letter: 'J',
    name: 'Jordan Blake',
    meta: '@jordanb · 4 hours ago',
    title: 'What are you listening to today?',
    text: 'Drop your favourite track and discover something new from the community.',
    likes: '♡ 86 likes',
    comments: '▤ 12 comments',
  },
];

export default function SamplePosts() {
  return SAMPLES.map((s) => (
    <article className="card-panel" style={{ padding: 22 }} key={s.name}>
      <div className="person-row">
        <div className={`avatar ${s.color}`}>{s.letter}</div>
        <div className="person-info">
          <b>{s.name}</b>
          <small>{s.meta}</small>
        </div>
      </div>
      <h3>{s.title}</h3>
      <p>{s.text}</p>
      <div style={{ display: 'flex', gap: 18, color: '#667085', marginTop: 14 }}>
        <span>{s.likes}</span>
        <span>{s.comments}</span>
        <span>↗ Share</span>
      </div>
    </article>
  ));
}
