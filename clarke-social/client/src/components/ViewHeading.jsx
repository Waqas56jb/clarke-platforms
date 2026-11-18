// Page title block (h1 + optional subtitle), with optional actions on the right.
export default function ViewHeading({ eyebrow, title, subtitle, actions }) {
  return (
    <header className="page-header view-heading">
      <div className="view-heading-text">
        {eyebrow && <span className="view-heading-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions}
    </header>
  );
}
