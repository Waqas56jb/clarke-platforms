import { useNavigation } from '../context/NavigationContext';

export default function WelcomeBanner() {
  const { openAuth } = useNavigation();
  return (
    <section className="welcome-banner" id="welcomeBanner">
      <div className="banner-copy">
        <span className="eyebrow">YOUR WORLD, YOUR PEOPLE</span>
        <h1>
          Good things happen
          <br />
          when we <em>connect.</em>
        </h1>
        <p>Share your moments, discover new voices and stay close to the people who matter.</p>
        <button className="btn btn-white" id="bannerJoin" onClick={() => openAuth('register')}>
          Join Clarke <span>→</span>
        </button>
      </div>
      <div className="banner-art">
        <div className="art-orbit orbit-one"></div>
        <div className="art-orbit orbit-two"></div>
        <div className="art-card card-a">
          ✦ <small>CREATE</small>
        </div>
        <div className="art-card card-b">
          ♡ <small>CONNECT</small>
        </div>
        <div className="art-card card-c">
          ▷ <small>DISCOVER</small>
        </div>
        <div className="art-center">C</div>
      </div>
    </section>
  );
}
