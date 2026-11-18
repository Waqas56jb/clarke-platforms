import { useAuth } from './context/AuthContext';
import { useNavigation } from './context/NavigationContext';
import AuthModal from './components/AuthModal';
import CommentsModal from './components/CommentsModal';
import FeedColumn from './components/FeedColumn';
import MobileNav from './components/MobileNav';
import PreviewNotice from './components/PreviewNotice';
import RightColumn from './components/RightColumn';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { usePaymentResult } from './hooks/usePaymentResult';
import { showsRightColumn } from './utils/views';

export default function App() {
  const { ready } = useAuth();
  const { view } = useNavigation();
  usePaymentResult(ready);

  return (
    <>
      <PreviewNotice />
      <div className="app-shell">
        <Sidebar />
        <main className="main-area">
          <Topbar />
          <section className="content-grid">
            <FeedColumn />
            <RightColumn visible={showsRightColumn(view)} />
          </section>
          <MobileNav />
        </main>
      </div>
      <AuthModal />
      <CommentsModal />
    </>
  );
}
