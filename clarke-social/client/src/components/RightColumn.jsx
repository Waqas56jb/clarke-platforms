import ViewButton from './ViewButton';

const TRENDS = [
  ['01', '#CreativeLife', '2.4k posts'],
  ['02', '#GoodVibes', '1.8k posts'],
  ['03', '#FoodAndFriends', '956 posts'],
  ['04', '#IslandLife', '742 posts'],
];

const PEOPLE = [
  ['avatar-purple', 'M', 'Maya Lewis', '@mayacreates'],
  ['avatar-orange', 'J', 'Jordan Blake', '@jordanb'],
  ['avatar-green', 'A', 'Alex Morgan', '@alexmorgan'],
];

export default function RightColumn({ visible }) {
  return (
    <aside className="right-column" style={visible ? undefined : { display: 'none' }}>
      <section className="card-panel trend-panel">
        <div className="section-heading">
          <div>
            <h3>Trending now</h3>
            <p>Conversations picking up</p>
          </div>
          <span className="trend-flame">↗</span>
        </div>
        {TRENDS.map(([n, tag, count]) => (
          <a className="trend" href="#discover" key={n}>
            <span className="trend-number">{n}</span>
            <span>
              <b>{tag}</b>
              <small>{count}</small>
            </span>
            <span className="trend-arrow">↗</span>
          </a>
        ))}
        <ViewButton className="text-btn" view="discover">
          Explore topics →
        </ViewButton>
      </section>
      <section className="card-panel people-panel">
        <div className="section-heading">
          <div>
            <h3>People to know</h3>
            <p>Find your next connection</p>
          </div>
          <span className="people-icon">✧</span>
        </div>
        {PEOPLE.map(([color, letter, name, handle]) => (
          <div className="person-row" key={handle}>
            <div className={`avatar ${color}`}>{letter}</div>
            <div className="person-info">
              <b>{name}</b>
              <small>{handle}</small>
            </div>
            <button className="follow-btn" data-demo-follow="">
              Follow
            </button>
          </div>
        ))}
        <ViewButton className="text-btn" view="discover">
          Find more people →
        </ViewButton>
      </section>
      <section className="callout-card">
        <div className="callout-icon">◉</div>
        <span className="eyebrow">CLOSER, WHEREVER YOU ARE</span>
        <h3>
          Hear their voice.
          <br />
          See their smile.
        </h3>
        <p>Make it a voice or video call with the people you care about.</p>
        <ViewButton className="btn btn-white" view="calls">
          Explore calling
        </ViewButton>
      </section>
      <div className="legal-links">
        <a href="#terms">Terms</a>
        <a href="#privacy">Privacy</a>
        <a href="#safety">Safety</a>
        <a href="#about">About</a>
        <span>Clarke Social · 2026</span>
      </div>
    </aside>
  );
}
