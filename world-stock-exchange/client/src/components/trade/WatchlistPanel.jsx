// The member's watchlist (GET /api/watchlist). Choosing an instrument loads it into the trade ticket.
import { Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useAsync } from '../../hooks/useAsync';
import { fetchWatchlist } from '../../services/marketsService';
import { AsyncView, EmptyState } from '../StateView';
import { ChangeValue, DataLabel, instrumentPrice } from '../markets/InstrumentBits';
import WatchButton from '../markets/WatchButton';

function WatchRows({ onSelect }) {
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const list = useAsync(fetchWatchlist, [user.id]);
  const remove = (id, watched) =>
    !watched && list.setData((d) => ({ ...d, instruments: d.instruments.filter((i) => i.id !== id) }));

  return (
    <AsyncView state={list} skeleton="row" count={4} loadingText="Loading your watchlist">
      {(d) =>
        d.instruments.length ? (
          <ul className="watch-list" id="watchRows">
            {d.instruments.map((i) => (
              <li key={i.id} className="watch-row">
                <WatchButton instrument={i} onChange={remove} />
                <div className="grow">
                  {i.quoteBased ? (
                    <span className="cell-title">{i.name}</span>
                  ) : (
                    <button type="button" className="link-button cell-title" onClick={() => onSelect(i.id)}>
                      {i.name}
                    </button>
                  )}
                  <DataLabel instrument={i} />
                </div>
                <div className="watch-figures">
                  <b>{instrumentPrice(i)}</b>
                  <ChangeValue instrument={i} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Star}
            plain
            title="Your watchlist is empty"
            action={
              <button type="button" className="btn btn-secondary" onClick={() => navigate('markets')}>
                Browse markets
              </button>
            }
          >
            Star instruments on the Markets screen to follow them here.
          </EmptyState>
        )
      }
    </AsyncView>
  );
}

export default function WatchlistPanel({ onSelect }) {
  const { user } = useAuth();
  const { openAuth } = useNavigation();
  return (
    <section className="panel" aria-labelledby="watchTitle">
      <div className="eyebrow">WATCHLIST</div>
      <h2 id="watchTitle">Your watchlist</h2>
      {user ? (
        <WatchRows onSelect={onSelect} />
      ) : (
        <EmptyState
          icon={Star}
          plain
          title="Sign in to keep a watchlist"
          action={
            <button type="button" className="btn btn-secondary" onClick={() => openAuth('login')}>
              Sign in
            </button>
          }
        >
          Your watchlist is saved to your practice account.
        </EmptyState>
      )}
    </section>
  );
}
