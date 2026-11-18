import { useCallback, useEffect, useState } from 'react';
import { HeartHandshake, Sparkles } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { blockMember, discoverProfiles, likeMember, passMember, reportMember } from '../../services/datingService';
import { PLAN_NAMES } from '../../utils/format';
import { EmptyState, ErrorState, Loading } from '../StateView';
import { useConfirm, useReport } from '../ui/ConfirmDialog';
import DatingCard from './DatingCard';
import MatchDialog from './MatchDialog';

function TierStrip({ tier, dailyLimit }) {
  const { showView } = useNavigation();
  return (
    <div className="dating-intro">
      <Sparkles size={20} aria-hidden="true" />
      <p className="grow">
        <b>{tier === 'free' ? 'Clarke Dating Free' : PLAN_NAMES[tier] || 'Clarke Dating Plus'}</b>
        <span>Up to {dailyLimit} profiles per discovery page</span>
      </p>
      <button type="button" className="btn-link" onClick={() => showView('datingPremium')}>
        {tier === 'free' ? 'Upgrade' : 'Premium'}
      </button>
    </div>
  );
}

export default function DatingDiscover({ onShowEditor }) {
  const toast = useToast();
  const { showView } = useNavigation();
  const { confirm } = useConfirm();
  const report = useReport();
  const [state, setState] = useState({ loading: true });
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [match, setMatch] = useState(null);

  const fetchProfiles = useCallback(
    () =>
      discoverProfiles()
        .then((data) => {
          setState({ data });
          setIndex(0);
        })
        .catch((e) => setState({ error: e.message })),
    []
  );

  const reload = () => {
    setState({ loading: true });
    fetchProfiles();
  };

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  if (state.loading) return <Loading variant="dating" text="Finding people" />;
  if (state.error)
    return (
      <div className="stack">
        <ErrorState title="Couldn't load profiles" message={state.error} onRetry={reload} />
        <button type="button" className="btn btn-secondary" id="datingCreateProfile" onClick={onShowEditor}>
          Edit dating profile
        </button>
      </div>
    );

  const { profiles, tier, dailyLimit } = state.data;
  // Profiles already liked are skipped.
  const deck = profiles.filter((p) => !p.liked);
  const current = deck[index];
  const next = () => setIndex((i) => i + 1);

  // Optimistic: the next card shows at once; the passed card comes back if the server refuses.
  const onPass = async () => {
    const at = index;
    next();
    try {
      await passMember(current.user_id);
    } catch (err) {
      toast(err.message, 'error');
      setIndex(at);
    }
  };

  const onLike = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const d = await likeMember(current.user_id);
      if (d.matched) setMatch(current);
      next();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const onBlock = async () => {
    const ok = await confirm({
      title: `Block ${current.display_name}?`,
      message: 'They will no longer appear in your dating discovery, and you will not be able to message each other.',
      confirmLabel: 'Block',
      danger: true,
    });
    if (!ok) return;
    try {
      await blockMember(current.user_id);
      toast('Member blocked.', 'success');
      next();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const onReport = async () => {
    const target = current;
    const reason = await report('dating profile');
    if (!reason) return;
    try {
      await reportMember(target.user_id, reason);
      toast('Report sent to the Clarke safety team.', 'success');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <div className="dating-discover">
      <TierStrip tier={tier} dailyLimit={dailyLimit} />
      {current ? (
        <DatingCard
          key={current.user_id}
          profile={current}
          busy={busy}
          onLike={onLike}
          onPass={onPass}
          onReport={onReport}
          onBlock={onBlock}
        />
      ) : (
        <EmptyState
          icon={HeartHandshake}
          title="No profiles to show right now."
          action={
            <button type="button" className="btn btn-primary" onClick={reload}>
              Refresh
            </button>
          }
        >
          Try adjusting your preferences or check back later.
        </EmptyState>
      )}
      {match && (
        <MatchDialog
          match={match}
          onClose={() => setMatch(null)}
          onMessage={() => showView('messages', { userId: match.user_id })}
        />
      )}
    </div>
  );
}
