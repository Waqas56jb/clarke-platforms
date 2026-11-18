import { useEffect, useRef, useState } from 'react';

// Self-view in a corner of the call stage. Drag it and it snaps to the nearest corner.
export default function LocalPreview({ stream, hidden }) {
  const videoRef = useRef(null);
  const startRef = useRef(null);
  const [corner, setCorner] = useState('tr');
  const [offset, setOffset] = useState(null);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  const onPointerDown = (e) => {
    startRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    const start = startRef.current;
    if (start) setOffset({ x: e.clientX - start.x, y: e.clientY - start.y });
  };
  const onPointerUp = (e) => {
    if (!startRef.current) return;
    startRef.current = null;
    const area = e.currentTarget.parentElement.getBoundingClientRect();
    const right = e.clientX > area.left + area.width / 2;
    const bottom = e.clientY > area.top + area.height / 2;
    setCorner(`${bottom ? 'b' : 't'}${right ? 'r' : 'l'}`);
    setOffset(null);
  };

  return (
    <div
      className={`call-local pip-${corner}${hidden ? ' is-hidden' : ''}${offset ? ' is-dragging' : ''}`}
      style={offset ? { transform: `translate(${offset.x}px, ${offset.y}px)` } : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <video id="localVideo" ref={videoRef} autoPlay muted playsInline aria-label="Your camera preview"></video>
    </div>
  );
}
