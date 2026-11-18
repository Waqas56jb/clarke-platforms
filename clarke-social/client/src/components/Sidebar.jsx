// Desktop sidebar (>=1024px) and tablet icon rail (768–1023px) from the same markup; CSS picks the layout.
import { useState } from 'react';
import { Ellipsis, Plus, SquarePen } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { NAV_ITEMS, TABLET_MORE } from '../utils/navigation';
import NavMenuList from './nav/NavMenuList';
import { useNavItem } from './nav/useNavItem';
import Dialog from './ui/Dialog';

export default function Sidebar() {
  const nav = useNavItem();
  const { openCreate, navigate } = useNavigation();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <aside className="sidebar" aria-label="Main navigation">
      <button type="button" className="brand" onClick={() => navigate('home')} aria-label="Clarke home">
        <span className="brand-mark" aria-hidden="true">
          C
        </span>
        <span className="brand-text">
          clarke<span className="brand-dot">.</span>
        </span>
      </button>
      <div className="side-create">
        <button type="button" className="btn btn-primary btn-block" onClick={openCreate}>
          <SquarePen size={20} aria-hidden="true" />
          <span className="side-create-label">Create post</span>
        </button>
      </div>
      <nav className="sidebar-nav main-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = nav.active(item);
          const count = nav.badge(item);
          return (
            <button
              key={item.key}
              type="button"
              className={`side-link nav-link${item.rail ? ' rail' : ''}${active ? ' active' : ''}`}
              style={item.rail ? { '--rail-order': item.rail } : undefined}
              aria-current={active ? 'page' : undefined}
              title={item.label}
              onClick={() => nav.open(item)}
            >
              <Icon aria-hidden="true" fill={active ? 'currentColor' : 'none'} fillOpacity={0.16} />
              <span className="side-link-label">{item.label}</span>
              {count > 0 && (
                <span className="count-badge" aria-label={`${count} unread`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
        <button
          type="button"
          className="side-link rail rail-only"
          style={{ '--rail-order': 3 }}
          title="Create post"
          aria-label="Create post"
          onClick={openCreate}
        >
          <Plus aria-hidden="true" />
        </button>
        <button type="button" className="side-link side-more" title="More" onClick={() => setMoreOpen(true)}>
          <Ellipsis aria-hidden="true" />
          <span className="sr-only">More sections</span>
        </button>
      </nav>
      <div className="sidebar-foot">© 2026 Clarke Social</div>
      {moreOpen && (
        <Dialog title="More" variant="drawer" onClose={() => setMoreOpen(false)}>
          <NavMenuList items={TABLET_MORE} onPicked={() => setMoreOpen(false)} />
        </Dialog>
      )}
    </aside>
  );
}
