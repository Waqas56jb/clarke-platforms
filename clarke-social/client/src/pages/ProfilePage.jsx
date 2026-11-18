// Edit profile: photo, display name and bio. Sign-out and account deletion live on the Account page.
import { useRef, useState } from 'react';
import { ArrowLeft, Camera, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/Avatar';
import { TextField } from '../components/account/FormFields';
import UploadProgress, { useUploadTask } from '../components/ui/UploadProgress';
import { updateMe, uploadProfilePhoto } from '../services/authService';

const BIO_MAX = 240;

function PhotoEditor() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const fileRef = useRef(null);
  const upload = useUploadTask();

  const onFile = async () => {
    const file = fileRef.current.files[0];
    fileRef.current.value = '';
    if (!file) return;
    try {
      const data = await upload.run((options) => uploadProfilePhoto(file, options));
      setUser(data.user);
      toast('Profile photo updated.', 'success');
    } catch (err) {
      if (err.code === 'UPLOAD_CANCELLED') toast('Upload cancelled.', 'info');
      else toast(err.message || 'Upload failed. Please try again.', 'error');
    }
  };

  return (
    <div className="profile-photo">
      <Avatar src={user.avatar} name={user.displayName} size="xl" alt={`${user.displayName}'s profile photo`} />
      <div className="grow stack-sm">
        {upload.busy ? (
          <UploadProgress label="Uploading photo" progress={upload.progress} onCancel={upload.cancel} />
        ) : (
          <>
            <button type="button" className="btn btn-secondary" onClick={() => fileRef.current.click()}>
              <Camera size={20} aria-hidden="true" />
              Change photo
            </button>
            <span className="field-hint">JPG, PNG, WebP or GIF.</span>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" hidden accept="image/jpeg,image/png,image/webp,image/gif" onChange={onFile} />
    </div>
  );
}

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { showView } = useNavigation();
  const toast = useToast();
  const [bio, setBio] = useState(user.bio || '');
  const [saving, setSaving] = useState(false);
  const viewProfile = () => showView('member', { id: user.id });

  const onSubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSaving(true);
    try {
      const data = await updateMe({ displayName: f.get('displayName'), bio: f.get('bio') });
      setUser(data.user);
      toast('Profile updated.', 'success');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="edit-profile">
      <button type="button" className="btn-link back-link" onClick={viewProfile}>
        <ArrowLeft size={16} aria-hidden="true" />
        Back to profile
      </button>
      <header className="page-header">
        <div>
          <h1>Edit profile</h1>
          <p>Choose how you appear to the Clarke community.</p>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={viewProfile}>
          <ExternalLink size={16} aria-hidden="true" />
          View my public profile
        </button>
      </header>
      <form className="card card-pad-lg stack edit-profile-form" id="profileForm" onSubmit={onSubmit}>
        <PhotoEditor />
        <hr className="divider" />
        <TextField
          id="profileDisplayName"
          label="Display name"
          name="displayName"
          defaultValue={user.displayName}
          maxLength={60}
          autoComplete="name"
          required
        />
        <div className="field">
          <label className="field-label" htmlFor="profileBio">
            Bio
          </label>
          <textarea
            id="profileBio"
            name="bio"
            maxLength={BIO_MAX}
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            aria-describedby="profileBioCount"
            placeholder="Tell people a little about yourself"
          />
          <span className="field-hint bio-count" id="profileBioCount">
            {bio.length}/{BIO_MAX} characters
          </span>
        </div>
        <div className="form-actions-sticky">
          <button className="btn btn-primary" disabled={saving} aria-busy={saving}>
            {saving && <span className="spinner" aria-hidden="true" />}
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
