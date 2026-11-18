import { useId, useRef, useState } from 'react';
import { SendHorizontal } from 'lucide-react';

const MAX_HEIGHT = 140;

// Enter sends, Shift+Enter adds a new line; the box grows with its text up to a few lines.
export default function ChatComposer({ onSend }) {
  const [text, setText] = useState('');
  const ref = useRef(null);
  const id = useId();

  const resize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  };

  const submit = (e) => {
    e?.preventDefault();
    const body = text.trim();
    if (!body) return;
    onSend(body);
    setText('');
    if (ref.current) ref.current.style.height = '';
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) submit(e);
  };

  return (
    <form className="chat-compose" onSubmit={submit}>
      <label className="sr-only" htmlFor={id}>
        Write a message
      </label>
      <textarea
        id={id}
        ref={ref}
        rows={1}
        maxLength={2000}
        placeholder="Write a message…"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          resize();
        }}
        onKeyDown={onKeyDown}
      />
      <button type="submit" className="icon-btn chat-send" aria-label="Send message" disabled={!text.trim()}>
        <SendHorizontal size={20} aria-hidden="true" />
      </button>
    </form>
  );
}
