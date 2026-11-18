import { useCalls } from '../../context/CallContext';
import { useNavigation } from '../../context/NavigationContext';
import { useAsync } from '../../hooks/useAsync';
import { listMatches } from '../../services/datingService';
import { mediaUrl } from '../../services/http';
import { initials } from '../../utils/format';
import { AsyncView } from '../StateView';

export default function DatingMatches() {
  const { showView } = useNavigation();
  const { startCall } = useCalls();
  const state = useAsync(() => listMatches().then((d) => d.matches), []);

  const call = (m, type) => {
    showView('calls');
    startCall(type, m.id, m.display_name);
  };

  return (
    <>
      <h2>Your mutual matches</h2>
      <p className="dating-muted">When you and another member like each other, you become a match.</p>
      <AsyncView state={state} loadingText="Loading matches…">
        {(matches) => (
          <div className="dating-matches">
            {matches.length ? (
              matches.map((m) => (
                <div className="dating-match" key={m.id}>
                  {m.photo_url || m.avatar ? (
                    <img src={m.photo_url || mediaUrl(m.avatar)} alt="" />
                  ) : (
                    <span>{initials(m.display_name)}</span>
                  )}
                  <div style={{ flex: 1 }}>
                    <b>{m.display_name}</b>
                    <small>
                      @{m.username} · {m.location || 'Clarke member'}
                    </small>
                  </div>
                  <div className="dating-actions" style={{ marginTop: 0 }}>
                    <button className="btn btn-primary" onClick={() => showView('messages', { userId: m.id })}>
                      Message
                    </button>
                    <button className="btn dating-more" onClick={() => call(m, 'audio')}>
                      Call
                    </button>
                    <button className="btn dating-more" onClick={() => call(m, 'video')}>
                      Video
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No matches yet. Like profiles to get started.</div>
            )}
          </div>
        )}
      </AsyncView>
    </>
  );
}
