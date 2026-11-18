import { Download, Ellipsis, Flag, Link, Repeat2, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Menu from '../ui/Menu';

// The three-dot menu shared by post cards, updates and the videos feed.
export default function PostMenu({ post: p, actions, className = 'icon-btn post-menu', direction }) {
  const { user } = useAuth();
  const mine = user?.id === p.userId;
  const canDownload = p.mediaType?.startsWith('video/') && (p.allowDownload || mine);
  return (
    <Menu
      label="Post options"
      className={className}
      direction={direction}
      trigger={<Ellipsis size={20} aria-hidden="true" />}
      items={[
        { label: 'Copy link', icon: <Link size={20} aria-hidden="true" />, onSelect: () => actions.copyLink(p) },
        {
          label: p.reposted ? 'Undo repost' : 'Repost',
          icon: <Repeat2 size={20} aria-hidden="true" />,
          onSelect: () => actions.repost(p),
          hidden: !actions.repost,
        },
        {
          label: 'Download video',
          icon: <Download size={20} aria-hidden="true" />,
          onSelect: () => actions.download(p),
          hidden: !canDownload,
        },
        { separator: true },
        {
          label: 'Report post',
          icon: <Flag size={20} aria-hidden="true" />,
          onSelect: () => actions.report(p),
          hidden: mine,
        },
        {
          label: 'Delete post',
          icon: <Trash2 size={20} aria-hidden="true" />,
          onSelect: () => actions.remove(p),
          danger: true,
          hidden: !mine,
        },
      ]}
    />
  );
}
