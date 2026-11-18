import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { forgotPassword, register, resendVerification, resetPassword, signIn } from '../services/authService';

const SUBMIT_LABELS = {
  login: 'Sign in to Clarke',
  register: 'Create my account',
  forgot: 'Email me a reset link',
  reset: 'Set new password',
};

function Field({ label, ...props }) {
  return (
    <div className="form-field">
      <label>{label}</label>
      <input {...props} />
    </div>
  );
}

export default function AuthModal() {
  const { refresh } = useAuth();
  const { authModal, closeAuth, setAuthMode, openAuth } = useNavigation();
  const toast = useToast();
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const { mode } = authModal;

  const reset = () => {
    setError('');
    setInfo('');
    setUnverifiedEmail('');
  };
  const close = () => {
    reset();
    closeAuth();
  };
  const switchMode = (next) => {
    reset();
    setAuthMode(next);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const f = Object.fromEntries(new FormData(formEl));
    reset();
    setBusy(true);
    try {
      if (mode === 'login') {
        await signIn({ identity: f.identity, password: f.password });
        await refresh();
        close();
        toast('Welcome back!');
      } else if (mode === 'register') {
        const data = await register(f);
        if (data.verificationRequired) openAuth('checkEmail', { message: data.message });
        else {
          await refresh();
          close();
          toast('Welcome to Clarke!');
        }
      } else if (mode === 'forgot') {
        const data = await forgotPassword(f.email);
        setInfo(data.message);
      } else if (mode === 'reset') {
        if (f.password !== f.confirm) throw new Error('The two passwords do not match.');
        const data = await resetPassword(authModal.token, f.password);
        await refresh();
        close();
        toast(data.message);
      }
      formEl.reset();
    } catch (err) {
      setError(err.message);
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
      setError(err.message);
    }
  };

  return (
    <div className={`modal-backdrop${authModal.open ? '' : ' hidden'}`} id="authModal">
      <section className="modal auth-modal">
        <button className="modal-close" onClick={close} aria-label="Close">
          ×
        </button>
        <div className="modal-brand">
          <span className="brand-mark">C</span>
          <b>Welcome to Clarke</b>
        </div>
        {mode === 'checkEmail' ? (
          <>
            <p className="post-body">{authModal.message}</p>
            <button className="btn btn-primary btn-block" onClick={() => switchMode('login')}>
              Back to sign in
            </button>
          </>
        ) : (
          <>
            {(mode === 'login' || mode === 'register') && (
              <div className="auth-tabs">
                <button className={mode === 'login' ? 'selected' : undefined} onClick={() => switchMode('login')}>
                  Sign in
                </button>
                <button className={mode === 'register' ? 'selected' : undefined} onClick={() => switchMode('register')}>
                  Create account
                </button>
              </div>
            )}
            {mode === 'forgot' && <p className="post-body">Enter your account email and we will send a reset link.</p>}
            {mode === 'reset' && <p className="post-body">Choose a new password for your Clarke account.</p>}
            <form id="authForm" onSubmit={onSubmit} key={mode}>
              {mode === 'register' && (
                <Field label="Display name" name="displayName" placeholder="Your name" required />
              )}
              {mode === 'login' && (
                <Field
                  label="Email or username"
                  name="identity"
                  id="authIdentity"
                  placeholder="you@example.com"
                  autoComplete="username"
                  required
                />
              )}
              {mode === 'register' && (
                <Field
                  label="Username"
                  name="username"
                  placeholder="choose_a_username"
                  autoComplete="username"
                  required
                />
              )}
              {(mode === 'register' || mode === 'forgot') && (
                <Field
                  label="Email address"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              )}
              {mode !== 'forgot' && (
                <Field
                  label={mode === 'reset' ? 'New password' : 'Password'}
                  name="password"
                  type="password"
                  placeholder="At least 10 characters"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                />
              )}
              {mode === 'reset' && (
                <Field
                  label="Confirm new password"
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                />
              )}
              <p className="form-error" id="authError" role="alert">
                {error}
              </p>
              {info && <p className="post-body">{info}</p>}
              {unverifiedEmail && (
                <button type="button" className="text-btn" onClick={resend}>
                  Resend verification email
                </button>
              )}
              <button className="btn btn-primary btn-block" id="authSubmit" disabled={busy}>
                {busy ? 'Please wait…' : SUBMIT_LABELS[mode]}
              </button>
            </form>
            {mode === 'login' && (
              <button className="text-btn" onClick={() => switchMode('forgot')}>
                Forgot your password?
              </button>
            )}
            {(mode === 'forgot' || mode === 'reset') && (
              <button className="text-btn" onClick={() => switchMode('login')}>
                Back to sign in
              </button>
            )}
          </>
        )}
        <p className="modal-note">By continuing, you agree to our Terms and Privacy Policy.</p>
      </section>
    </div>
  );
}
