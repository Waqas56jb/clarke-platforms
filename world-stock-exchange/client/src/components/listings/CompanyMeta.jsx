export default function CompanyMeta({ company }) {
  return (
    <div className="company-meta">
      <span>{company.symbol}</span>
      <span>{company.country}</span>
      <span>{company.sector}</span>
    </div>
  );
}
