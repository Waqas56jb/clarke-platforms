import { ImagePlus, Smile } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import Avatar from './Avatar';

// Compact "What's happening?" card; every control opens the create-post dialog (or sign-in).
export default function Composer() {
  const { user } = useAuth();
  const { openCreate } = useNavigation();
  return (
    <section className="card composer-card" id="composer" aria-label="Create a post">
      <div className="composer-row">
        <Avatar src={user?.avatar} name={user?.displayName || 'Clarke'} size="md" />
        <button type="button" className="composer-prompt" id="focusPost" onClick={openCreate}>
          What&apos;s happening?
        </button>
      </div>
      <div className="composer-quick">
        <button type="button" className="btn btn-ghost btn-sm" onClick={openCreate}>
          <ImagePlus size={20} aria-hidden="true" className="composer-icon-media" />
          Photo/Video
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={openCreate}>
          <Smile size={20} aria-hidden="true" className="composer-icon-feeling" />
          Feeling
        </button>
      </div>
    </section>
  );
}
