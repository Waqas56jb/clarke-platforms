import { initials } from '../../utils/format';

export default function DatingCard({ profile: p, onLike, onReport, onBlock }) {
  return (
    <article className="dating-card">
      {p.photo_url ? (
        <img className="dating-photo" src={p.photo_url} alt="Dating profile photo" loading="lazy" />
      ) : (
        <div className="dating-photo dating-placeholder">{initials(p.display_name)}</div>
      )}
      <div className="dating-card-body">
        <div className="dating-name">
          {p.display_name}, {p.age}
        </div>
        <div className="dating-location">⌖ {p.location}</div>
        <p>{p.dating_bio}</p>
        <div className="dating-interests">{p.interests || 'Getting to know new people'}</div>
        <div className="dating-actions">
          <button className="btn btn-primary" onClick={() => onLike(p.user_id)}>
            {p.liked ? 'Liked ♥' : 'Like ♥'}
          </button>
          <button className="btn dating-more" onClick={() => onReport(p.user_id)}>
            Report
          </button>
          <button className="btn dating-more" onClick={() => onBlock(p.user_id)}>
            Block
          </button>
        </div>
        {p.likesYou ? <small className="dating-hint">This person has liked you</small> : null}
      </div>
    </article>
  );
}
