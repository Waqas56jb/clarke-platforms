import { useNavigation } from '../context/NavigationContext';

export default function Brand({ className = '' }) {
  const { navigate } = useNavigation();
  return (
    <button
      type="button"
      className={`brand ${className}`.trim()}
      onClick={() => navigate('home')}
      aria-label="World Stock Exchange home"
    >
      <span className="brand-mark" aria-hidden="true">
        W
      </span>
      <span className="brand-text">WORLD STOCK EXCHANGE</span>
    </button>
  );
}
