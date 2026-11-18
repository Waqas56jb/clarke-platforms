// Vertical list of sections used by the mobile account sheet and the tablet "More" drawer.
import { ChevronRight } from 'lucide-react';
import { useNavItem } from './useNavItem';

export default function NavMenuList({ items, onPicked }) {
  const nav = useNavItem();
  return (
    <nav className="nav-list" aria-label="More sections">
      {items.map((item) => {
        const Icon = item.icon;
        const count = nav.badge(item);
        const active = nav.active(item);
        return (
          <button
            key={item.key}
            type="button"
            className={`nav-list-item${active ? ' active' : ''}`}
            aria-current={active ? 'page' : undefined}
            onClick={() => {
              onPicked?.();
              nav.open(item);
            }}
          >
            <Icon size={22} aria-hidden="true" />
            <span className="grow">{item.label}</span>
            {count > 0 && <span className="count-badge">{count}</span>}
            <ChevronRight size={18} className="chevron" aria-hidden="true" />
          </button>
        );
      })}
    </nav>
  );
}
