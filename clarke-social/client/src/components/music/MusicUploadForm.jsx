import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { uploadTrack } from '../../services/musicService';

export default function MusicUploadForm({ onUploaded }) {
  const { user } = useAuth();
  const { openAuth } = useNavigation();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user) return openAuth();
    const form = e.currentTarget;
    const el = form.elements;
    setError('');
    setBusy(true);
    try {
      await uploadTrack(
        {
          title: el.musicTitle.value,
          artist: el.musicArtist.value,
          rights: el.musicRights.value,
          declaration: el.musicDeclaration.checked ? 'true' : 'false',
        },
        el.musicAudio.files[0],
        el.musicProof.files[0]
      );
      form.reset();
      toast('Your track is published in Clarke Music.');
      onUploaded();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="music-panel music-upload">
      <div className="music-heading">
        <div>
          <h3>Upload your music</h3>
          <small>Artist and label submission studio</small>
        </div>
        <span className="music-chip">RIGHTS DECLARATION</span>
      </div>
      <form id="musicUploadForm" onSubmit={onSubmit}>
        <label htmlFor="musicTitle">Track title</label>
        <input id="musicTitle" required maxLength={120} placeholder="Enter track title" />
        <label htmlFor="musicArtist">Artist / rights holder</label>
        <input id="musicArtist" required maxLength={120} placeholder="Artist or label name" />
        <label htmlFor="musicRights">Rights category</label>
        <select id="musicRights" required defaultValue="">
          <option value="">Choose rights category</option>
          <option value="original">100% original music I created and control</option>
          <option value="licensed">Licensed recording with distribution and streaming permission</option>
        </select>
        <label htmlFor="musicAudio">Audio file</label>
        <input
          id="musicAudio"
          type="file"
          accept="audio/mpeg,audio/mp3,audio/wav,audio/flac,audio/aac,audio/ogg,audio/mp4"
          required
        />
        <label htmlFor="musicProof">Licence / ownership evidence (PDF, image or agreement)</label>
        <input id="musicProof" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx" />
        <label className="rights-check">
          <input type="checkbox" id="musicDeclaration" required />
          <span>
            I confirm I own the music or hold all permissions required to upload, stream, distribute and monetise this
            recording on Clarke. I understand tracks can be reported and will be removed if rights cannot be verified.
          </span>
        </label>
        {error && <p className="inline-error">{error}</p>}
        <button className="btn btn-primary" type="submit" style={{ marginTop: 12 }} disabled={busy}>
          {busy ? 'Uploading…' : 'Publish track ↗'}
        </button>
      </form>
      <p className="music-status">
        Evidence files are kept private and are only used if a track&apos;s rights are questioned. A licence to use a
        beat or sample may not grant every right needed for streaming, downloads, videos or monetisation.
      </p>
    </div>
  );
}
