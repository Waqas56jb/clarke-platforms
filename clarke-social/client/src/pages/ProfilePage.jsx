import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/Avatar';
import ViewHeading from '../components/ViewHeading';
import { deleteAccount, resendVerification, updateMe } from '../services/authService';
import { uploadAvatar } from '../services/usersService';
import { PLAN_NAMES } from '../utils/format';

const fieldStyle = {
  display: 'block',
  width: '100%',
  padding: 12,
  border: '1px solid var(--line)',
  borderRadius: 8,
  marginTop: 6,
};

function AccountStatus() {
  const { user, plans, emailConfigured } = useAuth();
  const toast = useToast();
  const resend = async () => {
    try {
      toast((await resendVerification(user.email)).message);
    } catch (e) {
      toast(e.message);
    }
  };
  return (
    <div className="card-panel" style={{ padding: 18, marginTop: 16 }}>
      <h3>Account</h3>
      <div className="settings-row">
        <span>
          <b>Email</b>
          <small>{user.email}</small>
        </span>
        <span>
          {user.emailVerified ? (
            '✓ Verified'
          ) : emailConfigured ? (
            <button className="text-btn" onClick={resend}>
              Send verification email
            </button>
          ) : (
            'Not verified (email not configured)'
          )}
        </span>
      </div>
      <div className="settings-row">
        <span>
          <b>Membership</b>
          <small>
            {plans.length
              ? plans
                  .map(
                    (p) => `${PLAN_NAMES[p.planKey] || p.planKey} until ${new Date(p.expiresAt).toLocaleDateString()}`
                  )
                  .join(' · ')
              : 'Free member'}
          </small>
        </span>
      </div>
    </div>
  );
}

function DeleteAccount() {
  const { setUser } = useAuth();
  const { navigate } = useNavigation();
  const toast = useToast();
  const [error, setError] = useState('');
  const remove = async (e) => {
    e.preventDefault();
    const password = new FormData(e.currentTarget).get('password');
    if (!window.confirm('Permanently delete your account and everything you have posted?')) return;
    try {
      const r = await deleteAccount(password);
      setUser(null);
      navigate('home');
      toast(r.message);
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <form className="card-panel" style={{ padding: 18, marginTop: 16 }} onSubmit={remove} id="deleteAccountForm">
      <h3>Delete account</h3>
      <p className="fine-print">
        This permanently deletes your profile, posts, stories, messages, music and films. It cannot be undone.
      </p>
      <div className="form-actions">
        <input
          name="password"
          type="password"
          required
          placeholder="Your password"
          autoComplete="current-password"
          style={{ padding: 11, border: '1px solid var(--line)', borderRadius: 8 }}
        />
        <button className="btn danger-btn">Delete my account</button>
      </div>
      {error && <p className="inline-error">{error}</p>}
    </form>
  );
}

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const { navigate, showView } = useNavigation();
  const toast = useToast();
  const fileRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSaving(true);
    try {
      const data = await updateMe({ displayName: f.get('displayName'), bio: f.get('bio') });
      setUser(data.user);
      toast('Profile updated.');
    } catch (err) {
      toast(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onAvatar = async () => {
    const file = fileRef.current.files[0];
    fileRef.current.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const data = await uploadAvatar(file);
      setUser(data.user);
      toast('Profile photo updated.');
    } catch (err) {
      toast(err.message);
    } finally {
      setUploading(false);
    }
  };

  const onLogout = async () => {
    await logout();
    navigate('home');
    toast('You have signed out.');
  };

  return (
    <>
      <ViewHeading title="Your profile" subtitle="Make your Clarke profile your own." />
      <form
        className="card-panel"
        id="profileForm"
        style={{ padding: 18, display: 'grid', gap: 12 }}
        onSubmit={onSubmit}
      >
        <div className="form-actions">
          <Avatar src={user.avatar} name={user.displayName} color="avatar-blue" className="" />
          <button type="button" className="btn" onClick={() => fileRef.current.click()} disabled={uploading}>
            {uploading ? 'Uploading…' : 'Change photo'}
          </button>
          <button type="button" className="text-btn" onClick={() => showView('member', { id: user.id })}>
            View my public profile
          </button>
          <input
            ref={fileRef}
            type="file"
            hidden
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={onAvatar}
          />
        </div>
        <label>
          Display name
          <input name="displayName" defaultValue={user.displayName} maxLength={60} style={fieldStyle} />
        </label>
        <label>
          Bio
          <textarea name="bio" maxLength={240} rows={3} style={fieldStyle} defaultValue={user.bio || ''}></textarea>
        </label>
        <button className="btn btn-primary" style={{ justifySelf: 'start' }} disabled={saving}>
          {saving ? 'Saving…' : 'Save profile'}
        </button>
        <button type="button" className="text-btn" id="logoutBtn" onClick={onLogout}>
          Sign out
        </button>
      </form>
      <AccountStatus />
      <DeleteAccount />
    </>
  );
}
