import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { isActive } from '../../utils/navigation';

// Opens a nav item (the "Profile" item opens the signed-in member's own profile) and reports if it is current.
export function useNavItem() {
  const { user, unreadMessages } = useAuth();
  const { view, params, showView, openAuth } = useNavigation();
  return {
    open: (item) => {
      if (item.self) return user ? showView('member', { id: user.id }) : openAuth();
      return showView(item.view);
    },
    active: (item) => isActive(item, view, params, user),
    badge: (item) => (item.badge === 'messages' && unreadMessages > 0 ? unreadMessages : 0),
  };
}
