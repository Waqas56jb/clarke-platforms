import { useNavigation } from './context/NavigationContext';
import AuthModal from './components/AuthModal';
import CommentsModal from './components/CommentsModal';
import EmailNotice from './components/EmailNotice';
import FeedColumn from './components/FeedColumn';
import MobileNav from './components/MobileNav';
import RightColumn from './components/RightColumn';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import CallOverlay from './components/calls/CallOverlay';
import CreatePostDialog from './components/feed/CreatePostDialog';
import { CommentsProvider } from './context/CommentsContext';
import { useUrlActions } from './hooks/useUrlActions';
import { isWideView, showsRightColumn } from './utils/views';

export default function App() {
  const { view, createOpen } = useNavigation();
  useUrlActions();
  const right = showsRightColumn(view);
  const layout = isWideView(view) ? ' layout-wide' : right ? ' has-right' : '';

  return (
    <CommentsProvider>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="app-shell">
        <Sidebar />
        <div className="app-main main-area">
          <Topbar />
          <EmailNotice />
          <div className={`content-grid${layout}`}>
            <main id="main" className="content-column feed-column" tabIndex={-1}>
              <FeedColumn />
            </main>
            {right && <RightColumn view={view} />}
          </div>
        </div>
        <MobileNav />
      </div>
      <AuthModal />
      <CommentsModal />
      {createOpen && <CreatePostDialog />}
      <CallOverlay />
    </CommentsProvider>
  );
}
