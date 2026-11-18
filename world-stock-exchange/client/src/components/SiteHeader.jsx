const NAV = [
  ['#markets', 'Markets'],
  ['#companies', 'Company listings'],
  ['#buying', 'Buying selection'],
  ['#issuer', 'List your company'],
  ['#trade', 'Trade'],
  ['#payments', 'Payments'],
  ['#gold-diamond-fund', 'Gold & diamonds'],
  ['#security', 'Security'],
];

export default function SiteHeader() {
  return (
    <header>
      <div className="brand">
        <div className="mark">W</div>
        <span>WORLD STOCK EXCHANGE</span>
      </div>
      <nav>
        {NAV.map(([href, label]) => (
          <a key={href} href={href}>
            {label}
          </a>
        ))}
      </nav>
      <button
        className="gold"
        onClick={() => alert('Account registration will be enabled after the exchange is licensed and operational.')}
      >
        Open account
      </button>
    </header>
  );
}
