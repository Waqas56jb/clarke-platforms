// Like, save, share, repost, copy link, download, report and delete for a post. Likes update on screen
// straight away and roll back if the server refuses; everything else applies the server's answer.
import { useAuth } from '../context/AuthContext';
import { useComments } from '../context/CommentsContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { useConfirm, useReport } from '../components/ui/ConfirmDialog';
import { mediaUrl } from '../services/http';
import {
  deletePost,
  downloadLink,
  recordShare,
  reportPost,
  toggleLike,
  toggleRepost,
  toggleSave,
} from '../services/postsService';

export const postLink = (id) => `${window.location.origin}/?post=${id}`;

export function usePostActions(update, onRemoved) {
  const { user } = useAuth();
  const { openAuth } = useNavigation();
  const { openComments } = useComments();
  const { confirm } = useConfirm();
  const report = useReport();
  const toast = useToast();

  const fail = (err) => toast(err.message || 'Something went wrong. Please try again.', 'error');
  const guarded = (fn) => async (post) => {
    if (!user) return openAuth();
    try {
      await fn(post);
    } catch (err) {
      fail(err);
    }
  };

  return {
    like: guarded(async (p) => {
      const before = { liked: p.liked, likes: p.likes };
      update(p.id, { liked: !p.liked, likes: Math.max(0, p.likes + (p.liked ? -1 : 1)) });
      try {
        const r = await toggleLike(p.id);
        update(p.id, { liked: r.liked, likes: r.likes });
      } catch (err) {
        update(p.id, before);
        throw err;
      }
    }),
    save: guarded(async (p) => {
      const r = await toggleSave(p.id);
      update(p.id, { saved: r.saved });
      toast(r.saved ? 'Saved to your collection.' : 'Removed from saved posts.', 'success');
    }),
    repost: guarded(async (p) => {
      const r = await toggleRepost(p.id);
      update(p.id, { reposted: r.reposted, reposts: Math.max(0, p.reposts + (r.reposted ? 1 : -1)) });
      toast(r.reposted ? 'Reposted to your updates.' : 'Repost removed.', 'success');
    }),
    comments: (p) => openComments(p.id, () => update(p.id, (current) => ({ comments: current.comments + 1 }))),
    report: guarded(async (p) => {
      const reason = await report('post');
      if (!reason) return;
      const r = await reportPost(p.id, reason);
      toast(r.message, 'success');
    }),
    remove: guarded(async (p) => {
      const ok = await confirm({
        title: 'Delete this post?',
        message: 'This cannot be undone.',
        confirmLabel: 'Delete',
        danger: true,
      });
      if (!ok) return;
      await deletePost(p.id);
      onRemoved?.(p.id);
      toast('Post deleted.', 'success');
    }),
    download: guarded(async (p) => {
      const { url } = await downloadLink(p.id);
      const a = document.createElement('a');
      a.href = mediaUrl(url);
      a.rel = 'noopener';
      a.click();
    }),
    copyLink: async (p) => {
      try {
        await navigator.clipboard.writeText(postLink(p.id));
        toast('Post link copied.', 'success');
      } catch {
        toast('Could not copy the link.', 'error');
      }
    },
    // Anyone can share: the device share sheet when available, otherwise the link is copied.
    // Cancelling the share sheet is not counted as a share.
    share: async (p) => {
      const link = postLink(p.id);
      try {
        let shared = false;
        if (navigator.share) {
          try {
            await navigator.share({ title: 'Clarke', text: p.body?.slice(0, 100), url: link });
            shared = true;
          } catch (err) {
            if (err.name === 'AbortError') return;
          }
        }
        if (!shared) {
          await navigator.clipboard.writeText(link);
          toast('Post link copied.', 'success');
        }
        const r = await recordShare(p.id);
        update(p.id, { shares: r.shares });
      } catch (err) {
        toast(err.message || 'Could not share this post.', 'error');
      }
    },
  };
}
