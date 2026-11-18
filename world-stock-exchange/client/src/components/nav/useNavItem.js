import { useNavigation } from '../../context/NavigationContext';
import { isActive } from '../../utils/navigation';

// Opens a nav item (signing in first where the screen needs an account) and reports if it is current.
export function useNavItem() {
  const { view, showView } = useNavigation();
  return {
    open: (item) => showView(item.view),
    active: (item) => isActive(item, view),
  };
}
