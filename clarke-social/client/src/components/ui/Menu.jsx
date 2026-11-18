// Dropdown menu with arrow-key navigation, Escape and click-outside. On phones it opens as a bottom sheet.
import { useEffect, useId, useRef, useState } from 'react';
import { MOBILE_QUERY, useMediaQuery } from '../../hooks/useMediaQuery';
import Dialog from './Dialog';

function MenuItems({ items, onPick, role }) {
  return items
    .filter((item) => item && !item.hidden)
    .map((item, i) =>
      item.separator ? (
        <div className="menu-separator" key={`sep${i}`} role="separator" />
      ) : (
        <button
          key={item.label}
          type="button"
          role={role}
          className={`menu-item${item.danger ? ' danger' : ''}`}
          onClick={() => onPick(item)}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      )
    );
}

export default function Menu({ label, trigger, items, align = 'right', direction = 'down', className = 'icon-btn' }) {
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!open || isMobile) return undefined;
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    wrapRef.current?.querySelector('.menu-item')?.focus();
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, isMobile]);

  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  const pick = (item) => {
    setOpen(false);
    item.onSelect();
  };

  const onKeyDown = (e) => {
    const nodes = [...(wrapRef.current?.querySelectorAll('.menu-item') || [])];
    const at = nodes.indexOf(document.activeElement);
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const step = e.key === 'ArrowDown' ? 1 : -1;
      nodes[(at + step + nodes.length) % nodes.length]?.focus();
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      (e.key === 'Home' ? nodes[0] : nodes[nodes.length - 1])?.focus();
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div className="menu-anchor" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className={className}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        {trigger}
      </button>
      {open && !isMobile && (
        <div
          id={menuId}
          className={`menu${align === 'left' ? ' menu-left' : ''}${direction === 'up' ? ' menu-up' : ''}`}
          role="menu"
          aria-label={label}
          onKeyDown={onKeyDown}
        >
          <MenuItems items={items} onPick={pick} role="menuitem" />
        </div>
      )}
      {open && isMobile && (
        <Dialog title={label} hideTitle onClose={() => setOpen(false)}>
          <div className="nav-list" id={menuId}>
            <MenuItems items={items} onPick={pick} />
          </div>
        </Dialog>
      )}
    </div>
  );
}
