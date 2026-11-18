// Desktop sidebar (>=1024px) and tablet icon rail (768–1023px) from the same markup; CSS picks the layout.
import { useState } from 'react';
import { Ellipsis } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { NAV_ITEMS, TABLET_MORE, visibleItems } from '../utils/navigation';
import Brand from './Brand';
import NavMenuList from './nav/NavMenuList';
import { useNavItem } from './nav/useNavItem';
import Dialog from './ui/Dialog';

export default function Sidebar() {
  const { user, ready } = useAuth();
  const { openAuth } = useNavigation();
  const nav = useNavItem();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <aside className="sidebar" aria-label="Main navigation">
      <Brand />
      <div className="side-cta">
        {ready && !user && (
          <button type="button" className="btn btn-accent btn-block" onClick={() => openAuth('register')}>
            Open account
          </button>
        )}
      </div>
      <nav className="sidebar-nav">
        {visibleItems(NAV_ITEMS, user).map((item) => {
          const Icon = item.icon;
          const active = nav.active(item);
          return (
            <button
              key={item.key}
              type="button"
              className={`side-link${item.rail ? ' rail' : ''}${active ? ' active' : ''}`}
              aria-current={active ? 'page' : undefined}
              title={item.label}
              onClick={() => nav.open(item)}
            >
              <Icon aria-hidden="true" />
              <span className="side-link-label">{item.label}</span>
            </button>
          );
        })}
        <button type="button" className="side-link side-more" title="More" onClick={() => setMoreOpen(true)}>
          <Ellipsis aria-hidden="true" />
          <span className="sr-only">More sections</span>
        </button>
      </nav>
      <div className="sidebar-foot">Practice platform · Not a licensed exchange</div>
      {moreOpen && (
        <Dialog title="More" variant="drawer" onClose={() => setMoreOpen(false)}>
          <NavMenuList items={TABLET_MORE} onPicked={() => setMoreOpen(false)} />
        </Dialog>
      )}
    </aside>
  );
}
