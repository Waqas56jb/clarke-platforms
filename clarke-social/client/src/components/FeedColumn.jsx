import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import AccountPage from '../pages/AccountPage';
import CallsPage from '../pages/CallsPage';
import ConnectionsPage from '../pages/ConnectionsPage';
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
  account: AccountPage,
  premium: PremiumPage,
  member: MemberPage,
  connections: ConnectionsPage,
  post: PostPage,
};

export default function FeedColumn() {
  const { user, ready } = useAuth();
  const { view, params } = useNavigation();
  if (!ready) return <Loading variant="feed" count={2} text="Loading Clarke" />;
  // Private pages fall back to home once the member signs out.
  const current = AUTH_REQUIRED_VIEWS.includes(view) && !user ? 'home' : view;
  const Page = PAGES[current];
  const key = `${current}:${JSON.stringify(params)}`;
  return (
    <div className="page-enter" key={key}>
      {Page ? <Page params={params} /> : <FeedPage view={current} />}
    </div>
  );
}
