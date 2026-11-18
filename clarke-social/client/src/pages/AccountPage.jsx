// Account: sign-in details, email verification, membership, password, sign out and account deletion.
import { useState } from 'react';
import { BadgeCheck, Crown, KeyRound, LogOut, Pencil } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/Avatar';
import DeleteAccountForm from '../components/account/DeleteAccountForm';
import { ActivePlans } from '../components/PlanStatus';
import { resendVerification } from '../services/authService';

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

function AccountInfo() {
  const { user } = useAuth();
  const { showView } = useNavigation();
  return (
    <Section id="accountInfoTitle" title="Account information">
      <div className="account-identity">
        <Avatar src={user.avatar} name={user.displayName} size="lg" />
        <div className="grow">
          <p className="list-row-title">{user.displayName}</p>
          <p className="list-row-sub">@{user.username}</p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => showView('profile')}>
          <Pencil size={16} aria-hidden="true" />
          Edit profile
        </button>
      </div>
      <dl className="account-details">
        <div className="account-detail">
          <dt>Display name</dt>
          <dd>{user.displayName}</dd>
        </div>
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
      </dl>
    </Section>
  );
}

function Membership() {
  const { plans } = useAuth();
  const { navigate } = useNavigation();
  return (
    <Section id="membershipTitle" title="Membership" description="Plans give 30 days of access and can be renewed.">
      {plans.length ? (
        <ActivePlans plans={plans} />
      ) : (
        <p className="text-muted">You don&apos;t have an active plan. Clarke is free to use.</p>
      )}
      <button type="button" className="btn btn-secondary account-action" onClick={() => navigate('premium')}>
        <Crown size={20} aria-hidden="true" />
        View plans &amp; payments
      </button>
    </Section>
  );
}

function Security() {
  const { emailConfigured, logout } = useAuth();
  const { navigate, openAuth } = useNavigation();
  const toast = useToast();
  const signOut = async () => {
    await logout();
    navigate('home');
    toast('You have signed out.', 'success');
  };
  return (
    <Section id="securityTitle" title="Security">
      <div className="list-row account-row">
        <span className="account-row-icon" aria-hidden="true">
          <KeyRound size={20} />
        </span>
        <div className="list-row-main">
          <p className="list-row-title">Password</p>
          <p className="account-row-text">
            {emailConfigured
              ? 'To change your password, use Forgot password on the sign-in screen. We will email you a reset link, and resetting signs you out on your other devices.'
              : 'Password changes are unavailable until email sending is set up for Clarke.'}
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
          <p className="account-row-text">Sign out of Clarke on this device.</p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" id="accountLogout" onClick={signOut}>
          Sign out
        </button>
      </div>
    </Section>
  );
}

export default function AccountPage() {
  return (
    <div className="account-page stack">
      <header className="page-header">
        <div>
          <h1>Account</h1>
          <p>Manage your sign-in details, membership and account.</p>
        </div>
      </header>
      <AccountInfo />
      <Membership />
      <Security />
      <Section id="deleteTitle" title="Delete account" danger>
        <DeleteAccountForm />
      </Section>
    </div>
  );
}
