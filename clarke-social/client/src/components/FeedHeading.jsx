export default function FeedHeading({ title, sort, onSortChange }) {
  return (
    <div className="feed-heading">
      <div>
        <h2 id="feedTitle">{title}</h2>
        <p>Fresh updates from the Clarke community</p>
      </div>
      <select id="feedSort" aria-label="Sort feed" value={sort} onChange={(e) => onSortChange(e.target.value)}>
        <option value="latest">Latest</option>
        <option value="popular">Popular</option>
      </select>
    </div>
  );
}
