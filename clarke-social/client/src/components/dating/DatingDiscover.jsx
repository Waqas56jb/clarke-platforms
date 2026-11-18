import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { blockMember, discoverProfiles, likeMember, reportMember } from '../../services/datingService';
import DatingCard from './DatingCard';

const TIER_NAMES = { free: 'Clarke Dating Free', dating_vip_monthly: 'Clarke Dating VIP' };

export default function DatingDiscover({ onShowEditor, onShowMatches }) {
  const toast = useToast();
  const [state, setState] = useState({ loading: true });

  const fetchProfiles = useCallback(
    () =>
      discoverProfiles()
        .then((data) => setState({ data }))
        .catch((e) => setState({ error: e.message })),
    []
  );

  const load = () => {
    setState({ loading: true });
    fetchProfiles();
  };

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const onLike = async (id) => {
    try {
      const d = await likeMember(id);
      toast(d.matched ? 'It’s a match! ♥' : 'Like sent.');
      if (d.matched) onShowMatches();
      else load();
    } catch (err) {
      toast(err.message);
    }
  };

  const onBlock = async (id) => {
    if (!window.confirm('Block this member? They will no longer appear in your dating discovery.')) return;
    try {
      await blockMember(id);
      toast('Member blocked.');
      load();
    } catch (err) {
      toast(err.message);
    }
  };

  const onReport = async (id) => {
    const reason = window.prompt('Why are you reporting this dating profile?');
    if (!reason) return;
    try {
      await reportMember(id, reason);
      toast('Report sent to the Clarke safety team.');
    } catch (err) {
      toast(err.message);
    }
  };

  if (state.loading) return <div className="loading-card">Finding people…</div>;
  if (state.error)
    return (
      <div className="empty-state">
        {state.error}
        <p>
          <button className="btn btn-primary" id="datingCreateProfile" onClick={onShowEditor}>
            Create profile
          </button>
        </p>
      </div>
    );

  const { profiles, tier, dailyLimit } = state.data;
  return (
    <>
      <div className="dating-intro">
        <b>{TIER_NAMES[tier] || 'Clarke Dating Plus'}</b>
        <span>
          {tier === 'free' ? 'Upgrade for more discovery options' : 'Premium membership active'} · Up to {dailyLimit}{' '}
          profiles per discovery page
        </span>
      </div>
      <div className="dating-grid">
        {profiles.length ? (
          profiles.map((p) => (
            <DatingCard key={p.user_id} profile={p} onLike={onLike} onReport={onReport} onBlock={onBlock} />
          ))
        ) : (
          <div className="empty-state">No profiles to show yet. Check back as more people join Clarke Dating.</div>
        )}
      </div>
    </>
  );
}
