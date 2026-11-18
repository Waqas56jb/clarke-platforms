// Like, save, share, repost, download, report and delete for a post, with the change applied to the
// post on screen straight away from the server's answer.
import { useAuth } from '../context/AuthContext';
import { useComments } from '../context/CommentsContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
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

export function usePostActions(update, onRemoved) {
  const { user } = useAuth();
  const { openAuth } = useNavigation();
  const { openComments } = useComments();
  const toast = useToast();

  const guarded = (fn) => async (post) => {
    if (!user) return openAuth();
    try {
      await fn(post);
    } catch (err) {
      toast(err.message);
    }
  };

  return {
    like: guarded(async (p) => {
      const r = await toggleLike(p.id);
      update(p.id, { liked: r.liked, likes: r.likes });
    }),
    save: guarded(async (p) => {
      const r = await toggleSave(p.id);
      update(p.id, { saved: r.saved });
      toast(r.saved ? 'Saved to your collection.' : 'Removed from saved posts.');
    }),
    repost: guarded(async (p) => {
      const r = await toggleRepost(p.id);
      update(p.id, { reposted: r.reposted, reposts: p.reposts + (r.reposted ? 1 : -1) });
      toast(r.reposted ? 'Reposted to your updates.' : 'Repost removed.');
    }),
    comments: guarded(async (p) =>
      openComments(p.id, () => update(p.id, (current) => ({ comments: current.comments + 1 })))
    ),
    report: guarded(async (p) => {
      const reason = window.prompt('Why are you reporting this post?');
      if (!reason) return;
      const r = await reportPost(p.id, reason);
      toast(r.message);
    }),
    remove: guarded(async (p) => {
      if (!window.confirm('Delete this post? This cannot be undone.')) return;
      await deletePost(p.id);
      onRemoved?.(p.id);
      toast('Post deleted.');
    }),
    download: guarded(async (p) => {
      const { url } = await downloadLink(p.id);
      const a = document.createElement('a');
      a.href = mediaUrl(url);
      a.rel = 'noopener';
      a.click();
    }),
    // Anyone can share: the device share sheet when available, otherwise the link is copied.
    // Cancelling the share sheet is not counted as a share.
    share: async (p) => {
      const link = `${window.location.origin}/?post=${p.id}`;
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
          toast('Post link copied.');
        }
        const r = await recordShare(p.id);
        update(p.id, { shares: r.shares });
      } catch (err) {
        toast(err.message || 'Could not share this post.');
      }
    },
  };
}
