// Modal dialog: centred on tablet/desktop, bottom sheet on mobile (CSS). Traps focus, closes on Escape,
// locks page scroll and returns focus to whatever opened it. Sheets can be swiped down to dismiss.
import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const SWIPE_CLOSE_PX = 90;
let openCount = 0;

// Locks page scroll while any dialog or full-screen overlay is open (counted, so overlays can nest).
export function useScrollLock() {
  useEffect(() => {
    openCount += 1;
    document.body.classList.add('scroll-locked');
    return () => {
      openCount -= 1;
      if (!openCount) document.body.classList.remove('scroll-locked');
    };
  }, []);
}

function useFocusTrap(ref, onClose) {
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const opener = document.activeElement;
    const node = ref.current;
    const first = node?.querySelector('[data-autofocus]') || node?.querySelector(FOCUSABLE);
    (first || node)?.focus({ preventScroll: true });

    const onKey = (e) => {
      if (e.key === 'Escape' && closeRef.current) {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab' || !node) return;
      const items = [...node.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const [head, tail] = [items[0], items[items.length - 1]];
      if (e.shiftKey && document.activeElement === head) {
        e.preventDefault();
        tail.focus();
      } else if (!e.shiftKey && document.activeElement === tail) {
        e.preventDefault();
        head.focus();
      }
    };
    node?.addEventListener('keydown', onKey);
    return () => {
      node?.removeEventListener('keydown', onKey);
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [ref]);
}

// Lets a bottom sheet follow the finger from its handle/header and close past a threshold.
function useSwipeToClose(ref, onClose) {
  const start = useRef(null);
  const onTouchStart = (e) => {
    if (!onClose || window.innerWidth >= 768) return;
    start.current = e.touches[0].clientY;
  };
  const onTouchMove = (e) => {
    if (start.current === null) return;
    const dy = Math.max(0, e.touches[0].clientY - start.current);
    ref.current.style.transform = `translateY(${dy}px)`;
  };
  const onTouchEnd = (e) => {
    if (start.current === null) return;
    const dy = e.changedTouches[0].clientY - start.current;
    start.current = null;
    ref.current.style.transform = '';
    if (dy > SWIPE_CLOSE_PX) onClose();
  };
  return { onTouchStart, onTouchMove, onTouchEnd };
}

export default function Dialog({
  title,
  onClose,
  children,
  footer,
  size = 'md',
  variant,
  id,
  className = '',
  hideTitle = false,
  dismissible = true,
  fullOnMobile = false,
  label,
}) {
  const ref = useRef(null);
  const titleId = useId();
  useScrollLock();
  useFocusTrap(ref, dismissible ? onClose : null);
  const swipe = useSwipeToClose(ref, dismissible ? onClose : null);

  const sizeClass = size === 'lg' ? ' dialog-lg' : size === 'xl' ? ' dialog-xl' : '';
  return createPortal(
    <div
      className={`dialog-backdrop${variant === 'drawer' ? ' drawer' : ''}`}
      id={id}
      onMouseDown={(e) => {
        if (dismissible && e.target === e.currentTarget) onClose?.();
      }}
    >
      <section
        ref={ref}
        className={`dialog${sizeClass}${fullOnMobile ? ' dialog-full' : ''} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title && !label ? titleId : undefined}
        aria-label={label}
        tabIndex={-1}
      >
        <div className="sheet-handle" aria-hidden="true" {...swipe} />
        {(title || onClose) && (
          <header className="dialog-head" {...swipe}>
            {title && (
              <h2 id={titleId} className={hideTitle ? 'sr-only' : undefined}>
                {title}
              </h2>
            )}
            {onClose && (
              <button
                type="button"
                className="icon-btn"
                onClick={onClose}
                aria-label="Close"
                style={{ marginLeft: 'auto' }}
              >
                <X size={20} aria-hidden="true" />
              </button>
            )}
          </header>
        )}
        <div className="dialog-body">{children}</div>
        {footer && <footer className="dialog-foot">{footer}</footer>}
      </section>
    </div>,
    document.body
  );
}
