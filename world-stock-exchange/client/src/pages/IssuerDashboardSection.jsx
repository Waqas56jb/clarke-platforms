import ApplicationCard from '../components/ApplicationCard';
import EmptyState from '../components/EmptyState';
import { useExchange } from '../context/ExchangeContext';
import { setApplicationStatus } from '../services/issuersService';

export default function IssuerDashboardSection() {
  const { applications, status, reload } = useExchange();

  const onReview = async (id, next) => {
    try {
      await setApplicationStatus(id, next);
      await reload();
    } catch (e) {
      alert(e.message);
    }
  };

  let content;
  if (status.error) content = <EmptyState>{status.error}</EmptyState>;
  else if (!applications.length) content = <EmptyState>No company submissions in this browser yet.</EmptyState>;
  else content = applications.map((a) => <ApplicationCard key={a.id} app={a} onReview={onReview} />);

  return (
    <section className="panel" id="issuerDashboard" style={{ marginTop: 18 }}>
      <div className="eyebrow">ISSUER WORKSPACE</div>
      <h2>Company submission status</h2>
      <p className="muted">
        Submissions made in this browser appear here for demonstration. The live service will require secure company
        accounts, document storage and administrator review.
      </p>
      <div id="issuerSubmissions" className="company-grid">
        {content}
      </div>
    </section>
  );
}
