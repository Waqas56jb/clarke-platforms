// Vertical list of sections used by the mobile "More" sheet and the tablet "More" drawer.
import { ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { visibleItems } from '../../utils/navigation';
import { useNavItem } from './useNavItem';

export default function NavMenuList({ items, onPicked }) {
  const { user } = useAuth();
  const nav = useNavItem();
  return (
    <nav className="nav-list" aria-label="More sections">
      {visibleItems(items, user).map((item) => {
        const Icon = item.icon;
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
            <ChevronRight size={18} className="chevron" aria-hidden="true" />
          </button>
        );
      })}
    </nav>
  );
}
