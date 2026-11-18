import { useAuth } from '../context/AuthContext';
import { initials } from '../utils/format';

export default function SideProfile() {
  const { user } = useAuth();
  return (
    <div className="side-profile" id="sideProfile">
      {user ? (
        <>
          <div className="avatar avatar-blue">{initials(user.displayName)}</div>
          <div>
            <b>{user.displayName}</b>
            <small>@{user.username}</small>
          </div>
        </>
      ) : (
        <>
          <div className="avatar avatar-blue">C</div>
          <div>
            <b>Welcome to Clarke</b>
            <small>Your social world</small>
          </div>
        </>
      )}
    </div>
  );
}
