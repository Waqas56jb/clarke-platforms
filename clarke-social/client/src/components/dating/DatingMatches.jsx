import { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { listMatches } from '../../services/datingService';
import { initials } from '../../utils/format';

export default function DatingMatches() {
  const toast = useToast();
  const [matches, setMatches] = useState(null);

  useEffect(() => {
    listMatches()
      .then((d) => setMatches(d.matches))
      .catch((e) => toast(e.message));
  }, [toast]);

  if (!matches) return null;
  return (
    <>
      <h2>Your mutual matches</h2>
      <p className="dating-muted">When you and another member like each other, you become a match.</p>
      <div className="dating-matches">
        {matches.length ? (
          matches.map((m) => (
            <div className="dating-match" key={m.id}>
              {m.photo_url ? <img src={m.photo_url} alt="" /> : <span>{initials(m.display_name)}</span>}
              <div>
                <b>{m.display_name}</b>
                <small>
                  @{m.username} · {m.location || 'Clarke member'}
                </small>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">No matches yet. Like profiles to get started.</div>
        )}
      </div>
    </>
  );
}
