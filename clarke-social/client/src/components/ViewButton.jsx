import { useNavigation } from '../context/NavigationContext';

// Any control that switches section; like the original, it carries "active" while its section is shown.
export default function ViewButton({ view, className = '', children, ...rest }) {
  const { view: current, showView } = useNavigation();
  const classes = [className, current === view ? 'active' : ''].filter(Boolean).join(' ');
  return (
    <button className={classes || undefined} onClick={() => showView(view)} {...rest}>
      {children}
    </button>
  );
}
