import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { deleteAccount } from '../../services/authService';
import { useConfirm } from '../ui/ConfirmDialog';
import { PasswordField } from './FormFields';

const WARNING =
  'This permanently deletes your account, practice balance, holdings, trades, watchlist and any company applications with their documents. It cannot be undone.';

export default function DeleteAccountForm() {
  const { setUser } = useAuth();
  const { navigate } = useNavigation();
  const { confirm } = useConfirm();
  const toast = useToast();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const password = new FormData(e.currentTarget).get('password');
    setError('');
    const ok = await confirm({
      title: 'Delete your account?',
      message: WARNING,
      confirmLabel: 'Delete my account',
      danger: true,
    });
    if (!ok) return;
    setBusy(true);
    try {
      const r = await deleteAccount(password);
      setUser(null);
      navigate('home');
      toast(r.message, 'success');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form id="deleteAccountForm" className="stack" onSubmit={onSubmit}>
      <p className="text-muted">{WARNING}</p>
      <PasswordField
        id="deletePassword"
        label="Confirm with your password"
        name="password"
        autoComplete="current-password"
        required
      />
      <div role="alert">{error && <p className="field-error">{error}</p>}</div>
      <div>
        <button className="btn btn-danger" disabled={busy} aria-busy={busy}>
          {busy ? <span className="spinner" aria-hidden="true" /> : <Trash2 size={20} aria-hidden="true" />}
          {busy ? 'Deleting…' : 'Delete my account'}
        </button>
      </div>
    </form>
  );
}
