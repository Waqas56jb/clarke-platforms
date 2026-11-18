// Sign in, create account, forgot/reset password and "check your email", driven by NavigationContext.authModal.
// Full-screen on phones, a 440px card on tablets, two columns (brand panel + form) on desktop.
import { useState } from 'react';
import { AlertCircle, ArrowLeft, MailCheck, TriangleAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { forgotPassword, register, resendVerification, resetPassword, signIn } from '../services/authService';
import { PasswordField, TextField } from './account/FormFields';
import Dialog from './ui/Dialog';

const TITLES = {
  login: 'Sign in to Clarke',
  register: 'Create your Clarke account',
  forgot: 'Reset your password',
  reset: 'Choose a new password',
  checkEmail: 'Check your email',
};

const SUBMIT_LABELS = {
  login: 'Sign in',
  register: 'Create account',
  forgot: 'Email me a reset link',
  reset: 'Set new password',
};

const FALLBACK_ERROR = 'Something went wrong while signing you in. Please try again.';
const PASSWORD_HINT = 'At least 10 characters';

function BrandMark() {
  return (
    <span className="auth-mark" aria-hidden="true">
      C
    </span>
  );
}

function AuthFields({ mode }) {
  return (
    <>
      {mode === 'register' && (
        <TextField id="authDisplayName" label="Display name" name="displayName" autoComplete="name" required />
      )}
      {mode === 'login' && (
        <TextField
          id="authIdentity"
          label="Email or username"
          name="identity"
          autoComplete="username"
          autoCapitalize="none"
          required
        />
      )}
      {mode === 'register' && (
        <TextField
          id="authUsername"
          label="Username"
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          hint="3–24 letters, numbers or underscores"
          required
        />
      )}
      {(mode === 'register' || mode === 'forgot') && (
        <TextField id="authEmail" label="Email address" name="email" type="email" autoComplete="email" required />
      )}
      {mode !== 'forgot' && (
        <PasswordField
          id="authPassword"
          label={mode === 'reset' ? 'New password' : 'Password'}
          name="password"
          hint={mode === 'login' ? undefined : PASSWORD_HINT}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          required
        />
      )}
      {mode === 'reset' && (
        <PasswordField
          id="authConfirm"
          label="Confirm new password"
          name="confirm"
          autoComplete="new-password"
          required
        />
      )}
    </>
  );
}

function ModeIntro({ mode, emailConfigured }) {
  if (mode === 'forgot')
    return (
      <div className="stack-sm">
        <h2 className="auth-heading">{TITLES.forgot}</h2>
        <p className="text-muted">Enter your account email and we will send a reset link.</p>
        {!emailConfigured && (
          <p className="notice notice-warning">
            <TriangleAlert size={18} aria-hidden="true" />
            <span>Password reset by email is unavailable until email sending is set up for Clarke.</span>
          </p>
        )}
      </div>
    );
  if (mode === 'reset')
    return (
      <div className="stack-sm">
        <h2 className="auth-heading">{TITLES.reset}</h2>
        <p className="text-muted">Choose a new password for your Clarke account.</p>
      </div>
    );
  return null;
}

function AuthTabs({ mode, onSwitch }) {
  return (
    <div className="tabs auth-tabs" role="tablist" aria-label="Sign in or create an account">
      {[
        ['login', 'Sign in'],
        ['register', 'Create account'],
      ].map(([key, label]) => (
        <button
          key={key}
          type="button"
          role="tab"
          className="tab"
          aria-selected={mode === key}
          aria-controls="authForm"
          onClick={() => onSwitch(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function AuthDialog() {
  const { refresh, emailConfigured } = useAuth();
  const { authModal, closeAuth, setAuthMode, openAuth } = useNavigation();
  const toast = useToast();
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const { mode } = authModal;

  const clearMessages = () => {
    setError('');
    setInfo('');
    setUnverifiedEmail('');
  };
  const switchMode = (next) => {
    clearMessages();
    setAuthMode(next);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const f = Object.fromEntries(new FormData(formEl));
    clearMessages();
    setBusy(true);
    try {
      if (mode === 'login') {
        await signIn({ identity: f.identity, password: f.password });
        await refresh();
        closeAuth();
        toast('Welcome back!', 'success');
      } else if (mode === 'register') {
        const data = await register(f);
        if (data.verificationRequired) openAuth('checkEmail', { message: data.message });
        else {
          await refresh();
          closeAuth();
          toast('Welcome to Clarke!', 'success');
        }
      } else if (mode === 'forgot') {
        const data = await forgotPassword(f.email);
        setInfo(data.message);
      } else if (mode === 'reset') {
        if (f.password !== f.confirm) throw new Error('The two passwords do not match.');
        const data = await resetPassword(authModal.token, f.password);
        await refresh();
        closeAuth();
        toast(data.message, 'success');
      }
      formEl.reset();
    } catch (err) {
      setError(err.message || FALLBACK_ERROR);
      if (err.code === 'EMAIL_NOT_VERIFIED') setUnverifiedEmail(f.identity);
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    try {
      const data = await resendVerification(unverifiedEmail);
      setInfo(data.message);
      setError('');
    } catch (err) {
      setError(err.message || FALLBACK_ERROR);
    }
  };

  return (
    <Dialog id="authModal" label={TITLES[mode]} onClose={closeAuth} size="xl" fullOnMobile className="auth-dialog">
      <div className="auth-layout">
        <aside className="auth-brand">
          <BrandMark />
          <p className="auth-brand-title">Welcome to Clarke</p>
          <p>Share posts, listen to music, watch films, message friends and meet new people, all in one community.</p>
        </aside>
        <div className="auth-main">
          <div className="auth-logo">
            <BrandMark />
            <span>Clarke</span>
          </div>
          {mode === 'checkEmail' ? (
            <div className="auth-check stack">
              <span className="auth-check-icon" aria-hidden="true">
                <MailCheck size={40} />
              </span>
              <h2 className="auth-heading">{TITLES.checkEmail}</h2>
              <p>{authModal.message}</p>
              <button type="button" className="btn btn-primary btn-block" onClick={() => switchMode('login')}>
                Back to sign in
              </button>
            </div>
          ) : (
            <div className="stack">
              {(mode === 'login' || mode === 'register') && <AuthTabs mode={mode} onSwitch={switchMode} />}
              <ModeIntro mode={mode} emailConfigured={emailConfigured} />
              <form id="authForm" className="stack" onSubmit={onSubmit} key={mode}>
                <AuthFields mode={mode} />
                {mode === 'login' && (
                  <button type="button" className="btn-link auth-forgot" onClick={() => switchMode('forgot')}>
                    Forgot password?
                  </button>
                )}
                <div id="authError" role="alert">
                  {error && (
                    <p className="notice notice-error">
                      <AlertCircle size={18} aria-hidden="true" />
                      <span>{error}</span>
                    </p>
                  )}
                </div>
                <div aria-live="polite">{info && <p className="notice notice-success">{info}</p>}</div>
                {unverifiedEmail && (
                  <button type="button" className="btn btn-secondary btn-block" onClick={resend}>
                    Resend verification email
                  </button>
                )}
                <button className="btn btn-primary btn-block" id="authSubmit" disabled={busy} aria-busy={busy}>
                  {busy && <span className="spinner" aria-hidden="true" />}
                  {busy ? 'Please wait…' : SUBMIT_LABELS[mode]}
                </button>
              </form>
              {(mode === 'forgot' || mode === 'reset') && (
                <button type="button" className="btn-link auth-back" onClick={() => switchMode('login')}>
                  <ArrowLeft size={16} aria-hidden="true" />
                  Back to sign in
                </button>
              )}
            </div>
          )}
          <p className="caption auth-terms">By continuing, you agree to our Terms and Privacy Policy.</p>
        </div>
      </div>
    </Dialog>
  );
}

export default function AuthModal() {
  const { authModal } = useNavigation();
  return authModal.open ? <AuthDialog /> : null;
}
