import { useState } from 'react';
import { CheckCircle2, FileText, Receipt } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useAsync } from '../hooks/useAsync';
import { fetchIssuerOrders, fetchMyApplications } from '../services/issuerService';
import ApplicationCard from '../components/issuer/ApplicationCard';
import BecomeIssuer from '../components/issuer/BecomeIssuer';
import DocumentManager from '../components/issuer/DocumentManager';
import IssuerForm from '../components/issuer/IssuerForm';
import { CompanyOrdersTable } from '../components/portfolio/PortfolioTables';
import PageHeader from '../components/site/PageHeader';
import RequireAuth from '../components/site/RequireAuth';
import { AsyncView, EmptyState } from '../components/StateView';

const TABS = [
  ['new', 'New application'],
  ['applications', 'My applications'],
  ['orders', 'Orders received'],
];

// Applies a documents updater to one application in a list.
const withDocuments = (apps, id, update) =>
  apps.map((a) => (a.id === id ? { ...a, documents: update(a.documents) } : a));

function DocumentsStep({ application, onDone, onAnother }) {
  const [app, setApp] = useState(application);
  return (
    <section className="panel stack" aria-labelledby="docsStepTitle">
      <p className="notice notice-success">
        <CheckCircle2 size={18} aria-hidden="true" />
        <span>
          Application {app.reference} for {app.name} was submitted and is pending review. It is not visible in Buying
          Selection until a reviewer approves it.
        </span>
      </p>
      <div>
        <div className="eyebrow">SUPPORTING DOCUMENTS</div>
        <h2 id="docsStepTitle">Upload documents for {app.name}</h2>
      </div>
      <DocumentManager
        application={app}
        onDocumentsChange={(update) => setApp((a) => ({ ...a, documents: update(a.documents) }))}
      />
      <div className="row-wrap">
        <button type="button" className="btn btn-primary" onClick={onDone}>
          Go to my applications
        </button>
        <button type="button" className="btn btn-secondary" onClick={onAnother}>
          Submit another company
        </button>
      </div>
    </section>
  );
}

function NewApplication({ onDone }) {
  const [submitted, setSubmitted] = useState(null);
  if (submitted) return <DocumentsStep application={submitted} onDone={onDone} onAnother={() => setSubmitted(null)} />;
  return <IssuerForm onSubmitted={setSubmitted} />;
}

function Applications() {
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const state = useAsync(fetchMyApplications, [user.id]);
  return (
    <section className="stack" aria-labelledby="workspaceTitle">
      <PageHeader level={2} id="workspaceTitle" eyebrow="ISSUER WORKSPACE" title="Company submission status">
        Your submissions appear here with their review status and reviewer notes. Documents are stored privately and can
        be added or removed while an application is pending review.
      </PageHeader>
      <AsyncView state={state} count={2} loadingText="Loading your applications">
        {(d) =>
          d.applications.length ? (
            <div className="application-list" id="issuerSubmissions">
              {d.applications.map((a) => (
                <ApplicationCard
                  key={a.id}
                  application={a}
                  onOpenListing={(id) => navigate('listing', { id })}
                  onDocumentsChange={(update) =>
                    state.setData((cur) => ({ ...cur, applications: withDocuments(cur.applications, a.id, update) }))
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState icon={FileText} title="No company submissions yet." />
          )
        }
      </AsyncView>
    </section>
  );
}

function OrdersReceived() {
  const { user } = useAuth();
  const state = useAsync(fetchIssuerOrders, [user.id]);
  return (
    <section className="card table-card" aria-labelledby="ordersReceivedTitle">
      <div className="table-card-title">
        <div className="eyebrow">ISSUER WORKSPACE</div>
        <h2 className="card-title" id="ordersReceivedTitle">
          Orders received
        </h2>
        <p className="caption">
          Practice orders placed by investors in your approved listings. No money changes hands.
        </p>
      </div>
      <AsyncView state={state} skeleton="row" count={3} loadingText="Loading orders">
        {(d) =>
          d.orders.length ? (
            <CompanyOrdersTable orders={d.orders} issuer id="issuerOrders" />
          ) : (
            <EmptyState icon={Receipt} plain title="No orders received yet." />
          )
        }
      </AsyncView>
    </section>
  );
}

function Workspace() {
  const { params, syncUrl } = useNavigation();
  const [tab, setTab] = useState(TABS.some(([key]) => key === params.tab) ? params.tab : 'new');
  const choose = (key) => {
    setTab(key);
    syncUrl('issuer', key === 'new' ? {} : { tab: key });
    window.scrollTo({ top: 0 });
  };
  return (
    <div className="stack">
      <div className="tabs" role="tablist" aria-label="Issuer workspace">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            className="tab"
            id={`issuerTab-${key}`}
            aria-selected={tab === key}
            aria-controls="issuerPanel"
            onClick={() => choose(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div id="issuerPanel" role="tabpanel" aria-labelledby={`issuerTab-${tab}`}>
        {tab === 'new' && <NewApplication onDone={() => choose('applications')} />}
        {tab === 'applications' && <Applications />}
        {tab === 'orders' && <OrdersReceived />}
      </div>
    </div>
  );
}

function IssuerGate() {
  const { hasRole } = useAuth();
  return hasRole('issuer') ? <Workspace /> : <BecomeIssuer />;
}

export default function IssuerPage() {
  return (
    <div className="stack">
      <PageHeader eyebrow="LIST YOUR COMPANY" title="Issuer portal">
        Submit your company for review, upload supporting documents and follow each application.
      </PageHeader>
      <RequireAuth
        title="Sign in to list your company"
        message="Issuer applications are linked to your account so you can follow their review."
      >
        <IssuerGate />
      </RequireAuth>
    </div>
  );
}
