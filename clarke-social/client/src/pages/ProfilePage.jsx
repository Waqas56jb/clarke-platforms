import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import ViewHeading from '../components/ViewHeading';
import { updateMe } from '../services/authService';

const fieldStyle = {
  display: 'block',
  width: '100%',
  padding: 12,
  border: '1px solid var(--line)',
  borderRadius: 8,
  marginTop: 6,
};

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const { navigate } = useNavigation();
  const toast = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    try {
      const data = await updateMe({ displayName: f.get('displayName'), bio: f.get('bio') });
      setUser(data.user);
      toast('Profile updated.');
    } catch (err) {
      toast(err.message);
    }
  };

  const onLogout = async () => {
    await logout();
    navigate('home');
    toast('You have signed out.');
  };

  return (
    <>
      <ViewHeading title="Your profile" subtitle="Make your Clarke profile your own." />
      <form
        className="card-panel"
        id="profileForm"
        style={{ padding: 18, display: 'grid', gap: 12 }}
        onSubmit={onSubmit}
      >
        <label>
          Display name
          <input name="displayName" defaultValue={user.displayName} maxLength={60} style={fieldStyle} />
        </label>
        <label>
          Bio
          <textarea name="bio" maxLength={240} rows={3} style={fieldStyle} defaultValue={user.bio || ''}></textarea>
        </label>
        <button className="btn btn-primary" style={{ justifySelf: 'start' }}>
          Save profile
        </button>
        <button type="button" className="text-btn" id="logoutBtn" onClick={onLogout}>
          Sign out
        </button>
      </form>
    </>
  );
}
