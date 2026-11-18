// Account: profile, roles and practice balance, issuer role, email verification, sign out and deletion.
import { useState } from 'react';
import { BadgeCheck, KeyRound, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { resendVerification, updateMe } from '../services/authService';
import Avatar from '../components/Avatar';
import DeleteAccountForm from '../components/account/DeleteAccountForm';
import { TextField } from '../components/account/FormFields';
import SignOutButton from '../components/nav/SignOutButton';
import PageHeader from '../components/site/PageHeader';
import RequireAuth from '../components/site/RequireAuth';
import { formatDate, money } from '../utils/format';

const ROLE_LABELS = { investor: 'Investor', issuer: 'Issuer', reviewer: 'Reviewer' };

function Section({ id, title, description, children, danger }) {
  return (
    <section className={`card card-pad-lg account-section${danger ? ' danger' : ''}`} aria-labelledby={id}>
      <div className="account-section-head">
        <h2 className="card-title" id={id}>
          {title}
        </h2>
        {description && <p className="text-muted text-sm">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function EmailStatus() {
  const { user, emailConfigured } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  if (user.emailVerified)
    return (
      <span className="badge badge-success">
        <BadgeCheck size={14} aria-hidden="true" />
        Verified
      </span>
    );
  if (!emailConfigured)
    return (
      <span className="account-unverified">
        <span className="badge badge-warning">Not verified</span>
        <span className="caption">Email verification isn&apos;t available yet.</span>
      </span>
    );

  const send = async () => {
    setBusy(true);
    try {
      toast((await resendVerification(user.email)).message, 'success');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };
  return (
    <button type="button" className="btn btn-secondary btn-sm" onClick={send} disabled={busy} aria-busy={busy}>
      {busy && <span className="spinner" aria-hidden="true" />}
      {busy ? 'Sending…' : 'Send verification email'}
    </button>
  );
}

function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user.displayName);
  const [busy, setBusy] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await updateMe({ displayName: name.trim() });
      setUser(r.user);
      toast('Display name saved.', 'success');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section id="profileTitle" title="Profile">
      <div className="account-identity">
        <Avatar name={user.displayName} size="lg" />
        <div className="grow">
          <p className="list-row-title">{user.displayName}</p>
          <p className="list-row-sub">@{user.username}</p>
        </div>
      </div>
      <form className="account-form" onSubmit={save} id="profileForm">
        <TextField
          id="displayName"
          label="Display name"
          value={name}
          maxLength={60}
          required
          onChange={(e) => setName(e.target.value)}
        />
        <button className="btn btn-primary" disabled={busy || !name.trim() || name.trim() === user.displayName}>
          {busy && <span className="spinner" aria-hidden="true" />}
          Save
        </button>
      </form>
      <dl className="account-details">
        <div className="account-detail">
          <dt>Username</dt>
          <dd>@{user.username}</dd>
        </div>
        <div className="account-detail">
          <dt>Email</dt>
          <dd className="account-email">
            <span className="truncate">{user.email}</span>
            <EmailStatus />
          </dd>
        </div>
        <div className="account-detail">
          <dt>Member since</dt>
          <dd>{formatDate(user.createdAt)}</dd>
        </div>
      </dl>
    </Section>
  );
}

function Roles() {
  const { user, setUser, hasRole } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const issuer = hasRole('issuer');

  const toggleIssuer = async () => {
    setBusy(true);
    try {
      const r = await updateMe({ issuer: !issuer });
      setUser(r.user);
      toast(issuer ? 'Issuer role turned off.' : 'Issuer role turned on.', 'success');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section id="rolesTitle" title="Practice account and roles">
      <dl className="account-details">
        <div className="account-detail">
          <dt>Practice balance</dt>
          <dd className="account-balance">{money(user.balance)}</dd>
        </div>
        <div className="account-detail">
          <dt>Roles</dt>
          <dd className="row-wrap" id="accountRoles">
            {user.roles.map((role) => (
              <span key={role} className="badge">
                {ROLE_LABELS[role] || role}
              </span>
            ))}
          </dd>
        </div>
      </dl>
      <label className="check-row toggle-row" htmlFor="issuerToggle">
        <input id="issuerToggle" type="checkbox" checked={issuer} disabled={busy} onChange={toggleIssuer} />
        <span>
          <span className="list-row-title">Issuer role</span>
          <span className="account-row-text">
            Lets you submit your company for listing and see orders placed in your listings. Your applications are kept
            if you turn it off.
          </span>
        </span>
      </label>
      <p className="caption">
        The practice balance is virtual money for practice trading only. It cannot be paid in or out.
      </p>
    </Section>
  );
}

function Security() {
  const { emailConfigured } = useAuth();
  const { openAuth } = useNavigation();
  return (
    <Section id="securityTitle" title="Sign-in and security">
      <div className="list-row account-row">
        <span className="account-row-icon" aria-hidden="true">
          <KeyRound size={20} />
        </span>
        <div className="list-row-main">
          <p className="list-row-title">Password</p>
          <p className="account-row-text">
            {emailConfigured
              ? 'To change your password, use Forgot password. We will email you a reset link, and resetting signs you out on your other devices.'
              : 'Password changes are unavailable until email sending is set up for World Stock Exchange.'}
          </p>
        </div>
        {emailConfigured && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => openAuth('forgot')}>
            Reset password
          </button>
        )}
      </div>
      <div className="list-row account-row">
        <span className="account-row-icon" aria-hidden="true">
          <LogOut size={20} />
        </span>
        <div className="list-row-main">
          <p className="list-row-title">Sign out</p>
          <p className="account-row-text">Sign out of World Stock Exchange on this device.</p>
        </div>
        <SignOutButton className="btn btn-secondary btn-sm" id="accountLogout" />
      </div>
    </Section>
  );
}

export default function AccountPage() {
  return (
    <div className="account-page stack">
      <PageHeader eyebrow="YOUR ACCOUNT" title="Account">
        Manage your profile, roles and sign-in.
      </PageHeader>
      <RequireAuth title="Sign in to manage your account">
        <Profile />
        <Roles />
        <Security />
        <Section id="deleteTitle" title="Delete account" danger>
          <DeleteAccountForm />
        </Section>
      </RequireAuth>
    </div>
  );
}
