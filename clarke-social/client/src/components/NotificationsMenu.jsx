import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useNotifications } from '../context/NotificationsContext';
import { timeAgo } from '../utils/format';
import Avatar from './Avatar';

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

export default function NotificationsMenu() {
  const { user } = useAuth();
  const { openAuth, showView } = useNavigation();
  const { items, unread, loading, error, load, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

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

  return (
    <div className="notif-wrap" ref={wrapRef}>
      <button className="icon-btn" title="Notifications" id="notificationsBtn" onClick={toggle}>
        ♧
      </button>
      {user && unread > 0 && <span className="notif-dot">{unread > 99 ? '99+' : unread}</span>}
      {open && (
        <div className="notif-menu" role="dialog" aria-label="Notifications">
          <div className="notif-head">Notifications</div>
          {loading && !items.length && <div className="notif-item">Loading…</div>}
          {error && <div className="notif-item">{error}</div>}
          {!loading && !error && !items.length && <div className="notif-item">You have no notifications yet.</div>}
          {items.map((n) => (
            <button key={n.id} className={`notif-item${n.read ? '' : ' unread'}`} onClick={() => go(n)}>
              <Avatar src={n.actor?.avatar} name={n.actor?.displayName} />
              <span>
                <b>{n.actor?.displayName || 'A member'}</b> {TEXT[n.type]}
                <small>{timeAgo(n.createdAt)}</small>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
