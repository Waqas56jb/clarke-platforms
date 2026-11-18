export default function ViewHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="view-heading">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}
