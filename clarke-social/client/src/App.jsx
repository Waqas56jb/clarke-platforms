import { useNavigation } from './context/NavigationContext';
import AuthModal from './components/AuthModal';
import CommentsModal from './components/CommentsModal';
import EmailNotice from './components/EmailNotice';
import FeedColumn from './components/FeedColumn';
import MobileNav from './components/MobileNav';
import RightColumn from './components/RightColumn';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { CommentsProvider } from './context/CommentsContext';
import { useUrlActions } from './hooks/useUrlActions';
import { showsRightColumn } from './utils/views';

export default function App() {
  const { view } = useNavigation();
  useUrlActions();

  return (
    <CommentsProvider>
      <div className="app-shell">
        <Sidebar />
        <main className="main-area">
          <Topbar />
          <EmailNotice />
          <section className="content-grid">
            <FeedColumn />
            <RightColumn visible={showsRightColumn(view)} />
          </section>
          <MobileNav />
        </main>
      </div>
      <AuthModal />
      <CommentsModal />
    </CommentsProvider>
  );
}
