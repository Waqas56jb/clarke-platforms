import Dialog from '../ui/Dialog';

// Full-screen photo viewer opened from a post image.
export default function MediaViewer({ src, alt, onClose }) {
  return (
    <Dialog title="Photo" hideTitle onClose={onClose} className="media-viewer" size="xl" fullOnMobile>
      <img src={src} alt={alt} />
    </Dialog>
  );
}
