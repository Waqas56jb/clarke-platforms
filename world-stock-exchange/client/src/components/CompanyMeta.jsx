export default function CompanyMeta({ app }) {
  return (
    <div className="company-meta">
      <span>{app.symbol}</span>
      <span>{app.country}</span>
      <span>{app.sector}</span>
    </div>
  );
}
