// Content-shaped loading placeholders; they fade in after 150ms so fast responses never flash.
const Line = ({ w = '100%', h = 12 }) => <div className="skeleton skeleton-line" style={{ width: w, height: h }} />;
const Circle = ({ size = 44 }) => <div className="skeleton skeleton-circle" style={{ width: size, height: size }} />;
const Block = ({ h = 200, w = '100%', r }) => (
  <div className="skeleton skeleton-block" style={{ height: h, width: w, borderRadius: r }} />
);

function Person({ size = 44 }) {
  return (
    <div className="row" style={{ gap: 12 }}>
      <Circle size={size} />
      <div className="grow stack-sm">
        <Line w="45%" />
        <Line w="30%" h={10} />
      </div>
    </div>
  );
}

const VARIANTS = {
  feed: () => (
    <div className="card card-pad stack">
      <Person />
      <Line />
      <Line w="80%" />
      <Block h={220} />
    </div>
  ),
  list: () => <Person />,
  stories: () => (
    <div className="row" style={{ gap: 16 }}>
      {Array.from({ length: 6 }, (_, i) => (
        <Circle key={i} size={64} />
      ))}
    </div>
  ),
  chat: () => (
    <div className="stack">
      <Block h={40} w="55%" r={16} />
      <div style={{ justifySelf: 'end', width: '45%' }}>
        <Block h={40} r={16} />
      </div>
      <Block h={56} w="62%" r={16} />
    </div>
  ),
  profile: () => (
    <div className="card stack" style={{ overflow: 'hidden' }}>
      <Block h={140} r={0} />
      <div className="card-pad stack">
        <Circle size={80} />
        <Line w="40%" h={16} />
        <Line w="60%" />
      </div>
    </div>
  ),
  dating: () => (
    <div className="card stack" style={{ overflow: 'hidden', maxWidth: 420, margin: '0 auto', width: '100%' }}>
      <Block h={360} r={0} />
      <div className="card-pad stack-sm">
        <Line w="50%" h={18} />
        <Line w="70%" />
      </div>
    </div>
  ),
  media: () => (
    <div className="stack-sm">
      <Block h={160} />
      <Line w="70%" />
      <Line w="40%" h={10} />
    </div>
  ),
  track: () => (
    <div className="row" style={{ gap: 12 }}>
      <Block h={48} w={48} />
      <div className="grow stack-sm">
        <Line w="50%" />
        <Line w="30%" h={10} />
      </div>
    </div>
  ),
  card: () => (
    <div className="card card-pad stack">
      <Line w="40%" h={16} />
      <Line />
      <Line w="70%" />
    </div>
  ),
};

export default function Skeleton({ variant = 'card', count = 1, label = 'Loading', grid }) {
  const Item = VARIANTS[variant] || VARIANTS.card;
  return (
    <div
      className="skeleton-group"
      role="status"
      aria-label={label}
      style={grid ? { gridTemplateColumns: `repeat(auto-fill, minmax(${grid}, 1fr))` } : undefined}
    >
      {Array.from({ length: count }, (_, i) => (
        <Item key={i} />
      ))}
    </div>
  );
}
