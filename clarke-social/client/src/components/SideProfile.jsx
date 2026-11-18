import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

export default function SideProfile() {
  const { user } = useAuth();
  return (
    <div className="side-profile" id="sideProfile">
      {user ? (
        <>
          <Avatar src={user.avatar} name={user.displayName} color="avatar-blue" />
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
