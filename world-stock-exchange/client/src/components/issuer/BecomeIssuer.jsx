// Shown to signed-in members without the issuer role; turns it on with PATCH /api/me { issuer: true }.
import { useState } from 'react';
import { FileUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { updateMe } from '../../services/authService';
import { EmptyState } from '../StateView';

export default function BecomeIssuer() {
  const { setUser } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const enable = async () => {
    setBusy(true);
    try {
      const { user } = await updateMe({ issuer: true });
      setUser(user);
      toast('Issuer role turned on. You can now submit your company.', 'success');
    } catch (e) {
      toast(e.message, 'error');
      setBusy(false);
    }
  };

  return (
    <EmptyState
      icon={FileUp}
      title="Turn on the issuer role to list your company"
      action={
        <button
          type="button"
          className="btn btn-accent"
          id="enableIssuer"
          onClick={enable}
          disabled={busy}
          aria-busy={busy}
        >
          {busy && <span className="spinner" aria-hidden="true" />}
          Turn on issuer role
        </button>
      }
    >
      Issuer accounts can submit company share offerings with supporting documents for review, follow each
      application&apos;s status and see the practice orders investors place. Your investor features stay as they are,
      and you can turn the role off again in your account.
    </EmptyState>
  );
}
