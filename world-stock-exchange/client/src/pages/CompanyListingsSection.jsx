import EmptyState from '../components/EmptyState';
import ListingCard from '../components/ListingCard';
import { useExchange } from '../context/ExchangeContext';

const NONE_YET =
  'No approved company share offerings have been published yet. Companies can submit a listing application below.';

function ListingsContent({ onSelect }) {
  const { applications, status } = useExchange();
  if (status.error) return <EmptyState>{status.error}</EmptyState>;
  if (!applications.length) return <EmptyState>{NONE_YET}</EmptyState>;
  const approved = applications.filter((a) => a.status === 'Approved');
  if (approved.length) return approved.map((a) => <ListingCard key={a.id} app={a} onSelect={onSelect} />);
  // The second sentence is the application-count notice from the earlier version of the page.
  return (
    <EmptyState>
      No approved company share offerings have been published yet. {applications.length} company application(s) received
      in this browser. Listings appear publicly only after administrator approval and applicable regulatory checks.
    </EmptyState>
  );
}

export default function CompanyListingsSection({ onSelect }) {
  return (
    <section id="companies" style={{ marginTop: 34 }}>
      <div className="section-head">
        <div>
          <div className="eyebrow">ISSUER DIRECTORY</div>
          <h2>Public company share listings</h2>
        </div>
        <a
          className="gold"
          style={{ padding: '10px 14px', borderRadius: 8, color: '#101a26', fontWeight: 800 }}
          href="#issuer"
        >
          Company upload portal
        </a>
      </div>
      <p className="muted">
        Browse company profiles and share offerings that have passed the exchange&apos;s review process. Sample entries
        are marked as demonstrations.
      </p>
      <div className="company-grid" id="companyListings">
        <ListingsContent onSelect={onSelect} />
      </div>
    </section>
  );
}
