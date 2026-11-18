// Content-shaped loading placeholders; they fade in after 150ms so fast responses never flash.
const Line = ({ w = '100%', h = 12 }) => <div className="skeleton skeleton-line" style={{ width: w, height: h }} />;

const VARIANTS = {
  card: () => (
    <div className="card card-pad stack">
      <Line w="40%" h={16} />
      <Line />
      <Line w="70%" />
    </div>
  ),
  row: () => (
    <div className="stack-sm" style={{ padding: '8px 0' }}>
      <Line w="55%" />
      <Line w="35%" h={10} />
    </div>
  ),
  stat: () => (
    <div className="card card-pad stack-sm">
      <Line w="50%" h={10} />
      <Line w="70%" h={22} />
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
