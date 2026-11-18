import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Phone, PhoneOff } from 'lucide-react';
import { useCalls } from '../../context/CallContext';
import Avatar from '../Avatar';

export default function IncomingCall({ call }) {
  const { acceptIncoming, declineIncoming } = useCalls();
  const acceptRef = useRef(null);
  const name = call.displayName || call.username;
  const kind = call.callType === 'video' ? 'video' : 'voice';

  useEffect(() => {
    acceptRef.current?.focus({ preventScroll: true });
  }, []);

  return createPortal(
    <div className="call-layer call-incoming-layer">
      <section
        className="call-incoming"
        role="alertdialog"
        aria-modal="true"
        aria-label={`Incoming ${kind} call from ${name}`}
      >
        <div className="call-pulse">
          <Avatar src={call.avatar} name={name} size="xxl" />
        </div>
        <div className="call-incoming-text">
          <h2 className="truncate">{name}</h2>
          {call.username && <p className="call-sub truncate">@{call.username}</p>}
          <p className="call-sub" aria-live="polite">
            Incoming {kind} call
          </p>
        </div>
        <div className="call-incoming-actions">
          <div className="call-action">
            <button
              type="button"
              id="declineCall"
              className="call-round call-round-end"
              aria-label="Decline incoming call"
              onClick={declineIncoming}
            >
              <PhoneOff size={28} aria-hidden="true" />
            </button>
            <span>Decline</span>
          </div>
          <div className="call-action">
            <button
              type="button"
              id="acceptCall"
              ref={acceptRef}
              className="call-round call-round-accept"
              aria-label="Accept incoming call"
              onClick={acceptIncoming}
            >
              <Phone size={28} aria-hidden="true" />
            </button>
            <span>Accept</span>
          </div>
        </div>
      </section>
    </div>,
    document.body
  );
}
