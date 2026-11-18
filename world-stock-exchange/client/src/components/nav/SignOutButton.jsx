import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';

export default function SignOutButton({ onDone, className, id }) {
  const { logout } = useAuth();
  const { navigate } = useNavigation();
  const toast = useToast();
  const signOut = async () => {
    onDone?.();
    try {
      await logout();
      navigate('home');
      toast('You have signed out.', 'success');
    } catch (e) {
      toast(e.message, 'error');
    }
  };
  return (
    <button type="button" className={className} id={id} onClick={signOut}>
      <LogOut size={20} aria-hidden="true" />
      <span>Sign out</span>
    </button>
  );
}
