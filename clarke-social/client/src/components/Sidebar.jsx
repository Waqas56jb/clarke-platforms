import SideProfile from './SideProfile';
import ViewButton from './ViewButton';

const NAV_ITEMS = [
  { view: 'home', icon: '⌂', label: 'Home' },
  { view: 'posts', icon: '✎', label: 'Posts & updates' },
  { view: 'videos', icon: '▷', label: 'Videos' },
  { view: 'music', icon: '♫', label: 'Clarke Music', isNew: true },
  { view: 'movies', icon: '🎬', label: 'Clarke Movies', isNew: true },
  { view: 'discover', icon: '⌕', label: 'Discover' },
  { view: 'dating', icon: '♥', label: 'Dating' },
  { view: 'messages', icon: '▤', label: 'Messages' },
  { view: 'calls', icon: '◉', label: 'Calls' },
  { view: 'saved', icon: '♡', label: 'Saved' },
  { view: 'profile', icon: '♙', label: 'My profile' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <a className="brand" href="#home">
        <span className="brand-mark">C</span>
        <span>
          clarke<span className="brand-dot">.</span>
        </span>
      </a>
      <SideProfile />
      <nav className="main-nav" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <ViewButton key={item.view} className="nav-link" view={item.view}>
            <span>{item.icon}</span> {item.label}
            {item.isNew && <i className="nav-new">NEW</i>}
          </ViewButton>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="upgrade-card">
          <div className="sparkle">✦</div>
          <b>Make more of Clarke</b>
          <p>Support creators and unlock premium experiences.</p>
          <ViewButton className="btn btn-white" view="premium">
            Explore Premium
          </ViewButton>
        </div>
        <ViewButton className="nav-link" view="settings">
          <span>⚙</span> Settings
        </ViewButton>
        <div className="sidebar-foot">© 2026 Clarke Social</div>
      </div>
    </aside>
  );
}
