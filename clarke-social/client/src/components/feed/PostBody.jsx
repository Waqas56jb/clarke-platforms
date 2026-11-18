import { useNavigation } from '../../context/NavigationContext';

// Links (not ending in punctuation) and #hashtags.
const TOKEN = /(https?:\/\/[^\s<]*[^\s<.,!?;:)'"]|#[A-Za-z0-9_]+)/g;

// Post text with links opened in a new tab and hashtags that search Discover.
export default function PostBody({ text, className = 'post-body' }) {
  const { navigate } = useNavigation();
  if (!text) return null;
  return (
    <p className={className}>
      {text.split(TOKEN).map((part, i) => {
        if (i % 2 === 0) return part;
        if (part.startsWith('#'))
          return (
            <button type="button" key={i} className="hashtag" onClick={() => navigate('discover', { q: part })}>
              {part}
            </button>
          );
        return (
          <a key={i} className="post-link" href={part} target="_blank" rel="noopener noreferrer nofollow">
            {part}
          </a>
        );
      })}
    </p>
  );
}
