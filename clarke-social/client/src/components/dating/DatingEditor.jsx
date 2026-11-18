import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { getDatingProfile, saveDatingProfile } from '../../services/datingService';
import { Loading } from '../StateView';

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

function Options({ list }) {
  return list.map(([value, label]) => (
    <option value={value} key={value}>
      {label}
    </option>
  ));
}

export default function DatingEditor({ isNew, onSaved }) {
  const toast = useToast();
  const [profile, setProfile] = useState(undefined);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDatingProfile()
      .then((d) => setProfile(d.profile))
      .catch(() => setProfile(null));
  }, []);

  if (profile === undefined) return <Loading variant="card" text="Loading your dating profile" />;

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.currentTarget).entries());
    setSaving(true);
    try {
      await saveDatingProfile(payload);
      toast('Dating profile saved.', 'success');
      onSaved();
    } catch (err) {
      toast(err.message, 'error');
      setSaving(false);
    }
  };

  return (
    <form id="datingProfileForm" className="card card-pad-lg dating-editor" onSubmit={onSubmit}>
      <div className="card-head">
        <div>
          <h2 className="card-title">{isNew ? 'Create your dating profile' : 'Your dating profile'}</h2>
          <p>
            {isNew
              ? 'Set up your profile to start discovering people. It only takes a minute.'
              : 'Update how you appear to other members and who you would like to meet.'}
          </p>
        </div>
      </div>
      <div className="notice dating-editor-note">
        <ShieldCheck size={20} aria-hidden="true" />
        <p>Clarke Dating is for adults aged 18+. Only share details you are comfortable showing other members.</p>
      </div>
      <div className="stack">
        <div className="field-row">
          <label className="field">
            <span className="field-label">Date of birth</span>
            <input
              name="birthDate"
              type="date"
              required
              defaultValue={profile?.birth_date || ''}
              max={new Date().toISOString().slice(0, 10)}
            />
          </label>
          <label className="field">
            <span className="field-label">Gender</span>
            <select name="gender" required defaultValue={profile?.gender || 'Woman'}>
              <Options list={GENDERS} />
            </select>
          </label>
        </div>
        <div className="field-row">
          <label className="field">
            <span className="field-label">Who would you like to meet?</span>
            <select name="interestedIn" defaultValue={profile?.interested_in || 'Woman'}>
              <Options list={INTERESTED} />
            </select>
          </label>
          <label className="field">
            <span className="field-label">Your town or area</span>
            <input
              name="location"
              maxLength={100}
              required
              placeholder="e.g. St Andrew's"
              defaultValue={profile?.location || ''}
            />
          </label>
        </div>
        <label className="field">
          <span className="field-label">Profile photo URL</span>
          <input name="photoUrl" type="url" placeholder="https://…" defaultValue={profile?.photo_url || ''} />
          <span className="field-hint">A link to a photo starting with https://</span>
        </label>
        <label className="field">
          <span className="field-label">About you</span>
          <textarea
            name="bio"
            maxLength={500}
            required
            rows={4}
            placeholder="A little about your personality and what you enjoy…"
            defaultValue={profile?.dating_bio || ''}
          ></textarea>
        </label>
        <label className="field">
          <span className="field-label">Interests</span>
          <input
            name="interests"
            maxLength={300}
            placeholder="Music, hiking, food, art…"
            defaultValue={profile?.interests || ''}
          />
          <span className="field-hint">Separate interests with commas.</span>
        </label>
      </div>
      <p className="fine-print">
        Your date of birth is used to verify the 18+ age requirement and is not displayed publicly.
      </p>
      <div className="dating-save-bar">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save dating profile'}
        </button>
      </div>
    </form>
  );
}
