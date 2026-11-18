import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import CallsPage from '../pages/CallsPage';
import DatingPage from '../pages/DatingPage';
import DatingPremiumPage from '../pages/DatingPremiumPage';
import DiscoverPage from '../pages/DiscoverPage';
import FeedPage from '../pages/FeedPage';
import MemberPage from '../pages/MemberPage';
import MessagesPage from '../pages/MessagesPage';
import PostPage from '../pages/PostPage';
import PremiumPage from '../pages/PremiumPage';
import ProfilePage from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';
import { AUTH_REQUIRED_VIEWS } from '../utils/views';
import { Loading } from './StateView';

const PAGES = {
  discover: DiscoverPage,
  dating: DatingPage,
  datingPremium: DatingPremiumPage,
  messages: MessagesPage,
  calls: CallsPage,
  profile: ProfilePage,
  settings: SettingsPage,
  premium: PremiumPage,
  member: MemberPage,
  post: PostPage,
};

export default function FeedColumn() {
  const { user, ready } = useAuth();
  const { view, params } = useNavigation();
  if (!ready)
    return (
      <div className="feed-column">
        <Loading />
      </div>
    );
  // Private pages fall back to home once the member signs out.
  const current = AUTH_REQUIRED_VIEWS.includes(view) && !user ? 'home' : view;
  const Page = PAGES[current];
  return (
    <div className="feed-column">
      {Page ? <Page key={JSON.stringify(params)} params={params} /> : <FeedPage view={current} />}
    </div>
  );
}
