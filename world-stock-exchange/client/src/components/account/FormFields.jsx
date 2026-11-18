// Labelled inputs shared by the sign-in, account and profile forms.
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function TextField({ id, label, hint, ...props }) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <input id={id} aria-describedby={hint ? `${id}Hint` : undefined} {...props} />
      {hint && (
        <span className="field-hint" id={`${id}Hint`}>
          {hint}
        </span>
      )}
    </div>
  );
}

export function PasswordField({ id, label, hint, ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className="password-field">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          aria-describedby={hint ? `${id}Hint` : undefined}
          {...props}
        />
        <button
          type="button"
          className="icon-btn"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-controls={id}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
        </button>
      </div>
      {hint && (
        <span className="field-hint" id={`${id}Hint`}>
          {hint}
        </span>
      )}
    </div>
  );
}
