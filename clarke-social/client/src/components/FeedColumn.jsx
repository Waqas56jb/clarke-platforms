import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import CallsPage from '../pages/CallsPage';
import DatingPage from '../pages/DatingPage';
import DatingPremiumPage from '../pages/DatingPremiumPage';
import DiscoverPage from '../pages/DiscoverPage';
import FeedPage from '../pages/FeedPage';
import MessagesPage from '../pages/MessagesPage';
import PremiumPage from '../pages/PremiumPage';
import ProfilePage from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';
import { AUTH_REQUIRED_VIEWS } from '../utils/views';

const PAGES = {
  discover: DiscoverPage,
  dating: DatingPage,
  datingPremium: DatingPremiumPage,
  messages: MessagesPage,
  calls: CallsPage,
  profile: ProfilePage,
  settings: SettingsPage,
  premium: PremiumPage,
};

export default function FeedColumn() {
  const { user } = useAuth();
  const { view } = useNavigation();
  const current = AUTH_REQUIRED_VIEWS.includes(view) && !user ? 'home' : view;
  const Page = PAGES[current];
  return <div className="feed-column">{Page ? <Page /> : <FeedPage view={current} />}</div>;
}
