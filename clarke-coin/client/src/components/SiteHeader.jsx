const NAV = [
  ['#home', 'Home'],
  ['#trade', 'Trade'],
  ['#charts', 'Charts'],
  ['#wallet', 'Wallet'],
  ['#transfer', 'Send Coins'],
  ['#messaging', 'Messages'],
  ['#history', 'History'],
  ['#admin', 'Admin'],
];

export default function SiteHeader() {
  return (
    <header>
      <div className="brand">
        <div className="coin">CC</div>
        <div>
          <h1>CLARKE COIN</h1>
          <small>INTERNATIONAL EXCHANGE</small>
        </div>
      </div>
      <nav>
        {NAV.map(([href, label], i) => (
          <a key={href} className={i === 0 ? 'active' : undefined} href={href}>
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}
