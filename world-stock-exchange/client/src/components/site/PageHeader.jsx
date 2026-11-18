// Screen or section heading: gold eyebrow, title, optional intro text and actions on the right.
export default function PageHeader({ eyebrow, title, children, actions, level = 1, id }) {
  const Heading = `h${level}`;
  return (
    <header className="section-head">
      <div className="section-head-text">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <Heading id={id}>{title}</Heading>
        {children && <p className="muted">{children}</p>}
      </div>
      {actions && <div className="section-head-actions">{actions}</div>}
    </header>
  );
}
