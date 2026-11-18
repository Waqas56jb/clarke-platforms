import ViewButton from './ViewButton';

const ITEMS = [
  { view: 'home', icon: '⌂', label: 'Home' },
  { view: 'videos', icon: '▷', label: 'Videos' },
  { view: 'music', icon: '♫', label: 'Music' },
  { view: 'movies', icon: '🎬', label: 'Movies' },
  { view: 'discover', icon: '⌕', label: 'Discover' },
  { view: 'dating', icon: '♥', label: 'Dating' },
  { view: 'messages', icon: '▤', label: 'Chat' },
  { view: 'profile', icon: '♙', label: 'Profile' },
];

export default function MobileNav() {
  return (
    <footer className="mobile-nav">
      {ITEMS.map((item) => (
        <ViewButton key={item.view} view={item.view}>
          {item.icon}
          <small>{item.label}</small>
        </ViewButton>
      ))}
    </footer>
  );
}
