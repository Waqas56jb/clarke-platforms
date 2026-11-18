import { Building2, Receipt } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useAsync } from '../hooks/useAsync';
import { fetchListings } from '../services/listingsService';
import { fetchCompanyOrders } from '../services/tradingService';
import ListingCard from '../components/listings/ListingCard';
import { CompanyOrdersTable } from '../components/portfolio/PortfolioTables';
import PageHeader from '../components/site/PageHeader';
import { AsyncView, EmptyState } from '../components/StateView';

const RECENT_ORDERS = 8;

function RecentOrders() {
  const { user } = useAuth();
  const orders = useAsync(fetchCompanyOrders, [user.id, user.balance]);
  return (
    <section className="card table-card" aria-labelledby="recentOrdersTitle">
      <div className="table-card-title">
        <div className="eyebrow">YOUR DEMO ORDER ACTIVITY</div>
        <h2 className="card-title" id="recentOrdersTitle">
          Recent company-share orders
        </h2>
      </div>
      <AsyncView state={orders} skeleton="row" count={3} loadingText="Loading your orders">
        {(d) =>
          d.orders.length ? (
            <CompanyOrdersTable orders={d.orders.slice(0, RECENT_ORDERS)} id="companyOrderHistory" />
          ) : (
            <EmptyState icon={Receipt} plain title="No demo orders placed yet." />
          )
        }
      </AsyncView>
    </section>
  );
}

export default function ListingsPage() {
  const { user } = useAuth();
  const { navigate, showView } = useNavigation();
  const listings = useAsync(fetchListings, []);

  return (
    <div className="stack-lg">
      <PageHeader
        eyebrow="ISSUER DIRECTORY"
        title="Public company share listings"
        actions={
          <button type="button" className="btn btn-accent" onClick={() => showView('issuer')}>
            Company upload portal
          </button>
        }
      >
        Browse company profiles and share offerings that have passed the exchange&apos;s review process. Sample entries
        are marked as demonstrations.
      </PageHeader>
      <section aria-labelledby="buyingTitle" id="buying">
        <PageHeader
          level={2}
          id="buyingTitle"
          eyebrow="INVESTOR MARKETPLACE"
          title="Buying Selection — available company shares"
          actions={<span className="pill">Approved listings only</span>}
        >
          Company shares appear here after an administrator marks the issuer application approved. Select a listing to
          prepare a demonstration buy order.
        </PageHeader>
        <AsyncView state={listings} count={3} grid="280px" loadingText="Loading listings">
          {(d) =>
            d.listings.length ? (
              <div className="card-grid" id="companyListings">
                {d.listings.map((l) => (
                  <ListingCard key={l.id} listing={l} onOpen={(id) => navigate('listing', { id })} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Building2}
                action={
                  <button type="button" className="btn btn-secondary" onClick={() => showView('issuer')}>
                    List your company
                  </button>
                }
              >
                No approved company share offerings have been published yet. Companies can submit a listing application
                below.
              </EmptyState>
            )
          }
        </AsyncView>
      </section>
      {user && <RecentOrders />}
    </div>
  );
}
