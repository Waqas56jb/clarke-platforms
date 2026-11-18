export default function MusicUploadForm({ onAudition }) {
  const onFileChange = (e) => {
    const f = e.target.files[0];
    if (f && f.type.startsWith('audio/'))
      onAudition({
        title: f.name.replace(/\.[^.]+$/, ''),
        artist: 'Local preview · Not uploaded',
        src: URL.createObjectURL(f),
      });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!e.currentTarget.elements.musicDeclaration.checked) return;
    alert(
      'Submission captured in this preview only. In production it must be uploaded securely, scanned, rights-checked and approved by a Clarke reviewer before anyone can stream it.'
    );
  };

  return (
    <div className="music-panel music-upload">
      <div className="music-heading">
        <div>
          <h3>Upload your music</h3>
          <small>Artist and label submission studio</small>
        </div>
        <span className="music-chip">RIGHTS REVIEW</span>
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
          onChange={onFileChange}
        />
        <label htmlFor="musicProof">Licence / ownership evidence (PDF, image or agreement)</label>
        <input id="musicProof" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx" />
        <label className="rights-check">
          <input type="checkbox" id="musicDeclaration" name="musicDeclaration" required />
          <span>
            I confirm I own the music or hold all permissions required to upload, stream, distribute and monetise this
            recording on Clarke. I understand submissions are reviewed and may be rejected or removed if rights cannot
            be verified.
          </span>
        </label>
        <button className="btn btn-primary" type="submit" style={{ marginTop: 12 }}>
          Submit for rights review ↗
        </button>
      </form>
      <p className="music-status">
        Uploads remain private and pending review until approved. A licence to use a beat or sample may not grant every
        right needed for streaming, downloads, videos or monetisation. Clarke must verify the relevant composition and
        sound-recording rights before publication.
      </p>
    </div>
  );
}
