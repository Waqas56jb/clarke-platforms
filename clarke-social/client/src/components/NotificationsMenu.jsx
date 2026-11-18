// Header notifications dropdown (bottom sheet on phones). Opening it marks everything as read.
import { useEffect, useRef, useState } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useNotifications } from '../context/NotificationsContext';
import { MOBILE_QUERY, useMediaQuery } from '../hooks/useMediaQuery';
import { timeAgo } from '../utils/format';
import Avatar from './Avatar';
import { EmptyState, ErrorState, Loading } from './StateView';
import Dialog from './ui/Dialog';

const TEXT = {
  follow: 'started following you',
  like: 'liked your post',
  comment: 'commented on your post',
  match: 'is a mutual dating match',
  message: 'sent you a message',
};

// Where each notification takes the member.
const target = (n) =>
  ({
    follow: ['member', { id: n.actor?.id }],
    like: ['post', { id: n.entityId }],
    comment: ['post', { id: n.entityId }],
    match: ['dating', { tab: 'matches' }],
    message: ['messages', { userId: n.actor?.id }],
  })[n.type];

function NotificationList({ onPick }) {
  const { items, loading, error, load } = useNotifications();
  if (loading && !items.length) return <Loading variant="list" count={4} text="Loading notifications" />;
  if (error) return <ErrorState plain message={error} onRetry={load} />;
  if (!items.length) return <EmptyState plain icon={Bell} title="You're all caught up!" />;
  return items.map((n) => (
    <button
      key={n.id}
      type="button"
      className={`search-hit notif-item${n.read ? '' : ' unread'}`}
      onClick={() => onPick(n)}
    >
      <Avatar src={n.actor?.avatar} name={n.actor?.displayName} size="sm" />
      <span className="list-row-main" style={{ whiteSpace: 'normal' }}>
        <span>
          <b>{n.actor?.displayName || 'A member'}</b> {TEXT[n.type]}
        </span>
        <span className="caption">{timeAgo(n.createdAt)}</span>
      </span>
      {!n.read && <span className="sr-only">Unread</span>}
    </button>
  ));
}

export default function NotificationsMenu() {
  const { user } = useAuth();
  const { openAuth, showView } = useNavigation();
  const { unread, load, markAllRead } = useNotifications();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open || isMobile) return undefined;
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, isMobile]);

  const toggle = () => {
    if (!user) return openAuth();
    if (!open) {
      load();
      if (unread) markAllRead();
    }
    setOpen((o) => !o);
  };

  const go = (n) => {
    setOpen(false);
    const [view, params] = target(n);
    showView(view, params);
  };

  const Icon = user && unread > 0 ? BellRing : Bell;
  return (
    <div className="menu-anchor" ref={wrapRef}>
      <button
        type="button"
        className="icon-btn"
        id="notificationsBtn"
        aria-label={unread ? `Open notifications, ${unread} unread` : 'Open notifications'}
        aria-expanded={open}
        onClick={toggle}
      >
        <Icon size={22} aria-hidden="true" />
        {user && unread > 0 && <span className="count-badge notif-dot">{unread > 99 ? '99+' : unread}</span>}
      </button>
      {open && !isMobile && (
        <div className="menu notif-menu" role="dialog" aria-label="Notifications" style={{ width: 360 }}>
          <div className="card-head" style={{ padding: '8px 12px 4px', margin: 0 }}>
            <h2 className="card-title">Notifications</h2>
          </div>
          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            <NotificationList onPick={go} />
          </div>
        </div>
      )}
      {open && isMobile && (
        <Dialog title="Notifications" onClose={() => setOpen(false)}>
          <NotificationList onPick={go} />
        </Dialog>
      )}
    </div>
  );
}
