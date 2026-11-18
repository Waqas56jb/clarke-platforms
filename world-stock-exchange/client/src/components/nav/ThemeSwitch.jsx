import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const OPTIONS = [
  ['light', 'Light', Sun],
  ['dark', 'Dark', Moon],
  ['system', 'System', Monitor],
];

export default function ThemeSwitch() {
  const { choice, setChoice } = useTheme();
  return (
    <div className="segmented" role="group" aria-label="Theme">
      {OPTIONS.map(([value, label, Icon]) => (
        <button key={value} type="button" aria-pressed={choice === value} onClick={() => setChoice(value)}>
          <Icon size={16} aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  );
}
