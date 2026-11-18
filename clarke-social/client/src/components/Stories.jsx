import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';

const STORIES = [
  ['ring-purple', 'M', 'Maya'],
  ['ring-orange', 'J', 'Jordan'],
  ['ring-green', 'A', 'Alex'],
  ['ring-pink', 'S', 'Sofia'],
  ['ring-cyan', 'D', 'Daniel'],
];

export default function Stories() {
  const { user } = useAuth();
  const { openAuth } = useNavigation();
  const toast = useToast();
  return (
    <section className="stories-section">
      <div className="section-heading">
        <div>
          <h2>Stories</h2>
          <p>Little moments from your community</p>
        </div>
        <button className="text-btn" id="storyInfo" onClick={() => toast('Stories are on the Clarke feature roadmap.')}>
          How stories work
        </button>
      </div>
      <div className="stories-row">
        <button
          className="story add-story"
          id="addStory"
          onClick={() => (user ? toast('Story publishing is coming in the next release.') : openAuth())}
        >
          <span className="story-ring">
            <span className="story-plus">+</span>
          </span>
          <b>Your story</b>
        </button>
        {STORIES.map(([ring, letter, name]) => (
          <div className="story" key={name}>
            <span className={`story-ring ${ring}`}>
              <span className="story-person">{letter}</span>
            </span>
            <b>{name}</b>
          </div>
        ))}
      </div>
    </section>
  );
}
