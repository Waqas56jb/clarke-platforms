import { HeartHandshake, MapPin, MessageCircle, Phone, Video } from 'lucide-react';
import { useCalls } from '../../context/CallContext';
import { useNavigation } from '../../context/NavigationContext';
import { useAsync } from '../../hooks/useAsync';
import { listMatches } from '../../services/datingService';
import { mediaUrl } from '../../services/http';
import { initials } from '../../utils/format';
import { AsyncView, EmptyState } from '../StateView';

function MatchCard({ match: m }) {
  const { showView } = useNavigation();
  const { startCall } = useCalls();
  const photo = m.photo_url || mediaUrl(m.avatar);
  const call = (type) => startCall(type, m.id, m.display_name, m.avatar);

  return (
    <li className="dating-match card">
      {photo ? (
        <img className="dating-match-photo" src={photo} alt="" loading="lazy" />
      ) : (
        <span className="dating-match-photo dating-placeholder" aria-hidden="true">
          {initials(m.display_name)}
        </span>
      )}
      <div className="dating-match-body">
        <h3 className="truncate">{m.display_name}</h3>
        <p className="truncate">
          <MapPin size={16} aria-hidden="true" />
          {m.location || 'Clarke member'}
        </p>
        <div className="dating-match-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm grow"
            onClick={() => showView('messages', { userId: m.id })}
          >
            <MessageCircle size={16} aria-hidden="true" />
            Message
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label={`Start voice call with ${m.display_name}`}
            onClick={() => call('audio')}
          >
            <Phone size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label={`Start video call with ${m.display_name}`}
            onClick={() => call('video')}
          >
            <Video size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
    </li>
  );
}

export default function DatingMatches() {
  const state = useAsync(() => listMatches().then((d) => d.matches), []);

  return (
    <AsyncView state={state} skeleton="card" count={2} loadingText="Loading matches" errorTitle="Couldn't load matches">
      {(matches) =>
        matches.length ? (
          <>
            <p className="text-muted dating-matches-intro">When you and another member like each other, you match.</p>
            <ul className="dating-matches">
              {matches.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </ul>
          </>
        ) : (
          <div className="dating-matches is-empty">
            <EmptyState icon={HeartHandshake} title="No matches yet.">
              Keep discovering people to find your connection.
            </EmptyState>
          </div>
        )
      }
    </AsyncView>
  );
}
