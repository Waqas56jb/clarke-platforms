import { useNavigation } from '../context/NavigationContext';

// Shown to signed-out visitors above the public feed.
export default function WelcomeBanner() {
  const { openAuth } = useNavigation();
  return (
    <section className="card welcome-banner" id="welcomeBanner" aria-labelledby="welcomeTitle">
      <span className="brand-mark" aria-hidden="true">
        C
      </span>
      <div className="welcome-copy">
        <h2 id="welcomeTitle">Good things happen when we connect.</h2>
        <p>Share your moments, discover new voices and stay close to the people who matter.</p>
      </div>
      <div className="welcome-actions">
        <button type="button" className="btn btn-primary" id="bannerJoin" onClick={() => openAuth('register')}>
          Join Clarke
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => openAuth('login')}>
          Sign in
        </button>
      </div>
    </section>
  );
}
