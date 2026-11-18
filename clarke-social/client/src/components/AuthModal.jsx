import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { signIn } from '../services/authService';

export default function AuthModal() {
  const { setUser } = useAuth();
  const { authModal, closeAuth, setAuthMode } = useNavigation();
  const toast = useToast();
  const [error, setError] = useState('');
  const mode = authModal.mode;
  const isRegister = mode === 'register';

  // The original cleared the error whenever the modal mode was (re)applied: on close/open and tab switch.
  const close = () => {
    setError('');
    closeAuth();
  };
  const switchMode = (next) => {
    setError('');
    setAuthMode(next);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const f = new FormData(formEl);
    const payload = isRegister
      ? {
          displayName: f.get('displayName'),
          username: f.get('username'),
          email: f.get('email'),
          password: f.get('password'),
        }
      : { identity: f.get('identity'), password: f.get('password') };
    try {
      const data = await signIn(mode, payload);
      setUser(data.user);
      closeAuth();
      formEl.reset();
      toast(isRegister ? 'Welcome to Clarke!' : 'Welcome back!');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={`modal-backdrop${authModal.open ? '' : ' hidden'}`} id="authModal">
      <section className="modal auth-modal">
        <button className="modal-close" onClick={close}>
          ×
        </button>
        <div className="modal-brand">
          <span className="brand-mark">C</span>
          <b>Welcome to Clarke</b>
        </div>
        <div className="auth-tabs">
          <button className={mode === 'login' ? 'selected' : undefined} onClick={() => switchMode('login')}>
            Sign in
          </button>
          <button className={isRegister ? 'selected' : undefined} onClick={() => switchMode('register')}>
            Create account
          </button>
        </div>
        <form id="authForm" onSubmit={onSubmit}>
          <div className={`form-field register-only${isRegister ? '' : ' hidden'}`}>
            <label>Display name</label>
            <input name="displayName" placeholder="Your name" />
          </div>
          <div className={`form-field${isRegister ? ' hidden' : ''}`}>
            <label>Email or username</label>
            <input name="identity" id="authIdentity" placeholder="you@example.com" autoComplete="username" />
          </div>
          <div className={`form-field register-only${isRegister ? '' : ' hidden'}`}>
            <label>Username</label>
            <input name="username" placeholder="choose_a_username" autoComplete="username" />
          </div>
          <div className={`form-field register-only${isRegister ? '' : ' hidden'}`}>
            <label>Email address</label>
            <input name="email" type="email" placeholder="you@example.com" autoComplete="email" />
          </div>
          <div className="form-field">
            <label>Password</label>
            <input
              name="password"
              type="password"
              placeholder="At least 10 characters"
              autoComplete="current-password"
            />
          </div>
          <p className="form-error" id="authError">
            {error}
          </p>
          <button className="btn btn-primary btn-block" id="authSubmit">
            {isRegister ? 'Create my account' : 'Sign in to Clarke'}
          </button>
        </form>
        <p className="modal-note">By continuing, you agree to our Terms and Privacy Policy.</p>
      </section>
    </div>
  );
}
