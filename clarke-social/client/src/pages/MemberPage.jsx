// Another member's profile: follow, message, call, block, and their posts.
import { useAuth } from '../context/AuthContext';
import { useCalls } from '../context/CallContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/Avatar';
import PostCard from '../components/PostCard';
import { AsyncView, EmptyState } from '../components/StateView';
import { useAsync } from '../hooks/useAsync';
import { usePostActions } from '../hooks/usePostActions';
import { usePostList } from '../hooks/usePostList';
import { listPosts } from '../services/postsService';
import { blockMember, getMember, toggleFollow } from '../services/usersService';

function MemberHeader({ member, onChange }) {
  const { user } = useAuth();
  const { openAuth, showView } = useNavigation();
  const { startCall } = useCalls();
  const toast = useToast();
  const self = user?.id === member.id;

  const follow = async () => {
    if (!user) return openAuth();
    try {
      const { following } = await toggleFollow(member.id);
      onChange({ isFollowing: following, followers: member.followers + (following ? 1 : -1) });
    } catch (e) {
      toast(e.message);
    }
  };

  const block = async () => {
    if (!window.confirm(`Block ${member.displayName}? They will no longer be able to message or call you.`)) return;
    try {
      const r = await blockMember(member.id);
      toast(r.message);
      onChange({ canMessage: false });
    } catch (e) {
      toast(e.message);
    }
  };

  const call = (type) => {
    showView('calls');
    startCall(type, member.id, member.displayName);
  };

  return (
    <section className="card-panel member-header">
      <Avatar src={member.avatar} name={member.displayName} />
      <div>
        <h1 style={{ font: '800 22px Manrope', margin: 0 }}>{member.displayName}</h1>
        <small className="dating-muted">@{member.username}</small>
        {member.bio && <p className="post-body">{member.bio}</p>}
        <div className="member-stats">
          <span>
            <b>{member.posts}</b> posts
          </span>
          <span>
            <b>{member.followers}</b> followers
          </span>
          <span>
            <b>{member.following}</b> following
          </span>
        </div>
      </div>
      {!self && (
        <div className="member-actions">
          <button className={`btn ${member.isFollowing ? '' : 'btn-primary'}`} onClick={follow}>
            {member.isFollowing ? 'Following' : 'Follow'}
          </button>
          {member.canMessage && (
            <>
              <button className="btn" onClick={() => showView('messages', { userId: member.id })}>
                Message
              </button>
              <button className="btn" onClick={() => call('audio')}>
                Voice call
              </button>
              <button className="btn" onClick={() => call('video')}>
                Video call
              </button>
            </>
          )}
          {user && (
            <button className="btn dating-more" onClick={block}>
              Block
            </button>
          )}
        </div>
      )}
      {!self && user && !member.canMessage && (
        <p className="fine-print" style={{ width: '100%', margin: 0 }}>
          You can message and call members who follow you back or who are a mutual dating match.
        </p>
      )}
    </section>
  );
}

export default function MemberPage({ params }) {
  const member = useAsync(() => getMember(params.id).then((d) => d.user), [params.id]);
  const posts = usePostList(() => listPosts({ userId: params.id }).then((d) => d.posts), [params.id]);
  const actions = usePostActions(posts.update, posts.remove);
  return (
    <AsyncView state={member} loadingText="Loading profile…">
      {(m) => (
        <>
          <MemberHeader member={m} onChange={(change) => member.setData((x) => ({ ...x, ...change }))} />
          <div className="feed-heading">
            <div>
              <h2>Posts</h2>
              <p>From {m.displayName}</p>
            </div>
          </div>
          <AsyncView state={posts} loadingText="Loading posts…">
            {(list) =>
              list.length ? (
                <div className="feed-list">
                  {list.map((p) => (
                    <PostCard key={p.id} post={p} actions={actions} />
                  ))}
                </div>
              ) : (
                <EmptyState title="No posts yet" />
              )
            }
          </AsyncView>
        </>
      )}
    </AsyncView>
  );
}
