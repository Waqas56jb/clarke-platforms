// Star toggle for the member's watchlist. Signed-out visitors are asked to sign in.
import { useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { toggleWatch } from '../../services/marketsService';

export default function WatchButton({ instrument, onChange }) {
  const { user } = useAuth();
  const { openAuth } = useNavigation();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const watched = Boolean(user && instrument.watched);

  const toggle = async () => {
    if (!user) {
      openAuth('login');
      return;
    }
    setBusy(true);
    try {
      const r = await toggleWatch(instrument.id);
      onChange(instrument.id, r.watched);
      toast(
        r.watched ? `${instrument.name} added to your watchlist.` : `${instrument.name} removed from your watchlist.`,
        'success'
      );
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className="icon-btn watch-btn"
      aria-pressed={watched}
      aria-label={watched ? `Remove ${instrument.name} from watchlist` : `Add ${instrument.name} to watchlist`}
      title={watched ? 'Remove from watchlist' : 'Add to watchlist'}
      onClick={toggle}
      disabled={busy}
    >
      <Star size={20} aria-hidden="true" fill={watched ? 'currentColor' : 'none'} />
    </button>
  );
}
