const SORTS = [
  ['latest', 'Latest'],
  ['popular', 'Popular'],
];

// Feed title with the Latest / Popular switch. `level` is the heading level (1 when it heads the page).
export default function FeedHeading({ title, subtitle, sort, onSortChange, level = 2 }) {
  const Heading = level === 1 ? 'h1' : 'h2';
  return (
    <div className={`feed-heading${level === 1 ? ' page-header' : ''}`}>
      <div className="feed-heading-text">
        <Heading id="feedTitle">{title}</Heading>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="segmented" role="group" aria-label="Sort posts">
        {SORTS.map(([value, label]) => (
          <button type="button" key={value} aria-pressed={sort === value} onClick={() => onSortChange(value)}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
