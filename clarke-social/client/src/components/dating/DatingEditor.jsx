import { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { getDatingProfile, saveDatingProfile } from '../../services/datingService';

const GENDERS = [
  ['Woman', 'Woman'],
  ['Man', 'Man'],
  ['Non-binary', 'Non-binary'],
  ['Other', 'Other'],
];
const INTERESTED = [
  ['Woman', 'Women'],
  ['Man', 'Men'],
  ['Non-binary', 'Non-binary people'],
  ['Everyone', 'Everyone'],
];

export default function DatingEditor({ onSaved }) {
  const toast = useToast();
  const [profile, setProfile] = useState(undefined);

  useEffect(() => {
    getDatingProfile()
      .then((d) => setProfile(d.profile))
      .catch(() => setProfile(null));
  }, []);

  if (profile === undefined) return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      await saveDatingProfile(payload);
      toast('Dating profile saved.');
      onSaved();
    } catch (err) {
      toast(err.message);
    }
  };

  return (
    <form id="datingProfileForm" className="card-panel dating-editor" onSubmit={onSubmit}>
      <h2>Create your dating profile</h2>
      <p>Clarke Dating is for adults aged 18+. Only share details you are comfortable showing other members.</p>
      <div className="dating-form-grid">
        <label>
          Date of birth
          <input
            name="birthDate"
            type="date"
            required
            defaultValue={profile?.birth_date || ''}
            max={new Date().toISOString().slice(0, 10)}
          />
        </label>
        <label>
          Gender
          <select name="gender" required defaultValue={profile?.gender || 'Woman'}>
            {GENDERS.map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Who would you like to meet?
          <select name="interestedIn" defaultValue={profile?.interested_in || 'Woman'}>
            {INTERESTED.map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Your town or area
          <input
            name="location"
            maxLength={100}
            required
            placeholder="e.g. St Andrew's"
            defaultValue={profile?.location || ''}
          />
        </label>
        <label className="wide">
          Profile photo URL (https)
          <input name="photoUrl" type="url" placeholder="https://…" defaultValue={profile?.photo_url || ''} />
        </label>
        <label className="wide">
          About you
          <textarea
            name="bio"
            maxLength={500}
            required
            rows={3}
            placeholder="A little about your personality and what you enjoy…"
            defaultValue={profile?.dating_bio || ''}
          ></textarea>
        </label>
        <label className="wide">
          Interests
          <input
            name="interests"
            maxLength={300}
            placeholder="Music, hiking, food, art…"
            defaultValue={profile?.interests || ''}
          />
        </label>
      </div>
      <button className="btn btn-primary">Save dating profile</button>
      <p className="fine-print">
        Your date of birth is used to verify the 18+ age requirement and is not displayed publicly. This is a profile
        and matching preview; complete identity, age and moderation checks before public launch.
      </p>
    </form>
  );
}
