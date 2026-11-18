// A member's profile: cover, avatar, counts, follow / message / call / block, then their posts.
import { useState } from 'react';
import { Ellipsis, FileText, MessageCircle, Phone, UserCog, UserX, Pencil, Video } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCalls } from '../context/CallContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/Avatar';
import PostCard from '../components/PostCard';
import { EmptyState, ErrorState, Loading } from '../components/StateView';
import { useConfirm } from '../components/ui/ConfirmDialog';
import Menu from '../components/ui/Menu';
import { useAsync } from '../hooks/useAsync';
import { usePostActions } from '../hooks/usePostActions';
import { usePostList } from '../hooks/usePostList';
import { listPosts } from '../services/postsService';
import { blockMember, getMember, toggleFollow } from '../services/usersService';

function MemberActions({ member, onChange }) {
  const { user } = useAuth();
  const { openAuth, showView } = useNavigation();
  const { startCall } = useCalls();
  const { confirm } = useConfirm();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  if (user?.id === member.id)
    return (
      <div className="member-actions">
        <button type="button" className="btn btn-secondary" onClick={() => showView('profile')}>
          <Pencil size={20} aria-hidden="true" />
          Edit profile
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => showView('account')}>
          <UserCog size={20} aria-hidden="true" />
          Account
        </button>
      </div>
    );

  const follow = async () => {
    if (!user) return openAuth();
    const wanted = !member.isFollowing;
    const counts = (following) => ({
      isFollowing: following,
      followers: Math.max(0, member.followers + (following === member.isFollowing ? 0 : following ? 1 : -1)),
    });
    onChange(counts(wanted));
    setBusy(true);
    try {
      const { following } = await toggleFollow(member.id);
      onChange(counts(following));
    } catch (err) {
      onChange(counts(member.isFollowing));
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const block = async () => {
    const ok = await confirm({
      title: `Block ${member.displayName}?`,
      message: 'They will no longer be able to message or call you, or find you in dating.',
      confirmLabel: 'Block',
      danger: true,
    });
    if (!ok) return;
    try {
      const r = await blockMember(member.id);
      toast(r.message, 'success');
      onChange({ canMessage: false });
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <div className="member-actions">
      <button
        type="button"
        className={`btn ${member.isFollowing ? 'btn-secondary' : 'btn-primary'}`}
        onClick={follow}
        disabled={busy}
      >
        {member.isFollowing ? 'Following' : 'Follow'}
      </button>
      {member.canMessage && (
        <>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => showView('messages', { userId: member.id })}
          >
            <MessageCircle size={20} aria-hidden="true" />
            Message
          </button>
          <button
            type="button"
            className="icon-btn member-icon-btn"
            aria-label="Start voice call"
            onClick={() => startCall('audio', member.id, member.displayName)}
          >
            <Phone size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-btn member-icon-btn"
            aria-label="Start video call"
            onClick={() => startCall('video', member.id, member.displayName)}
          >
            <Video size={20} aria-hidden="true" />
          </button>
        </>
      )}
      {user && (
        <Menu
          label="More options"
          className="icon-btn member-icon-btn"
          trigger={<Ellipsis size={20} aria-hidden="true" />}
          items={[
            {
              label: `Block ${member.displayName}`,
              icon: <UserX size={20} aria-hidden="true" />,
              onSelect: block,
              danger: true,
            },
          ]}
        />
      )}
    </div>
  );
}

function MemberHeader({ member: m, onChange }) {
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const connections = (tab) => navigate('connections', { id: m.id, tab });
  return (
    <section className="card member-header" aria-labelledby="memberName">
      <div className="member-cover" aria-hidden="true" />
      <div className="member-header-body">
        <div className="member-header-top">
          <Avatar src={m.avatar} name={m.displayName} size="xxl" className="member-avatar" />
          <MemberActions member={m} onChange={onChange} />
        </div>
        <h1 id="memberName" className="member-name">
          {m.displayName}
        </h1>
        <p className="member-handle">@{m.username}</p>
        {m.bio && <p className="member-bio">{m.bio}</p>}
        <div className="member-stats">
          <span className="member-stat">
            <b>{m.posts}</b> Posts
          </span>
          <button type="button" className="member-stat" onClick={() => connections('followers')}>
            <b>{m.followers}</b> Followers
          </button>
          <button type="button" className="member-stat" onClick={() => connections('following')}>
            <b>{m.following}</b> Following
          </button>
        </div>
        {user && user.id !== m.id && !m.canMessage && (
          <p className="fine-print">
            You can message and call members who follow you back or who are a mutual dating match.
          </p>
        )}
      </div>
    </section>
  );
}

function MemberPosts({ id, name }) {
  const posts = usePostList(() => listPosts({ userId: id }).then((d) => d.posts), [id]);
  const actions = usePostActions(posts.update, posts.remove);
  let content;
  if (posts.loading && !posts.data) content = <Loading text="Loading posts" variant="feed" count={2} />;
  else if (posts.error && !posts.data)
    content = <ErrorState title="Couldn't load posts." message={posts.error} onRetry={posts.reload} />;
  else if (!posts.data.length) content = <EmptyState icon={FileText} title="No posts yet." />;
  else content = posts.data.map((p) => <PostCard key={p.id} post={p} actions={actions} />);
  return (
    <section className="section" aria-labelledby="memberPostsTitle">
      <div className="section-title">
        <h2 id="memberPostsTitle">Posts</h2>
        <span className="text-sm text-muted truncate">From {name}</span>
      </div>
      <div className="feed-list">{content}</div>
    </section>
  );
}

export default function MemberPage({ params }) {
  const member = useAsync(() => getMember(params.id).then((d) => d.user), [params.id]);
  if (member.loading && !member.data) return <Loading text="Loading profile" variant="profile" />;
  if (member.error && !member.data)
    return <ErrorState title="Couldn't load this profile right now." message={member.error} onRetry={member.reload} />;
  const m = member.data;
  return (
    <>
      <MemberHeader member={m} onChange={(change) => member.setData((x) => ({ ...x, ...change }))} />
      <MemberPosts id={params.id} name={m.displayName} />
    </>
  );
}
