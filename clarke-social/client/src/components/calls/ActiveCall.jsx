import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Minimize2, PhoneOff } from 'lucide-react';
import { useCalls } from '../../context/CallContext';
import { MOBILE_QUERY, useMediaQuery } from '../../hooks/useMediaQuery';
import Avatar from '../Avatar';
import CallControls from './CallControls';
import LocalPreview from './LocalPreview';
import { useCallTimer } from './useCallTimer';

// Full screen on phones; a large centred stage on tablet/desktop that can shrink to a floating pill.
export default function ActiveCall({ stage }) {
  const { localStream, remoteStream, endCall } = useCalls();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [minimised, setMinimised] = useState(false);
  const remoteRef = useRef(null);
  const duration = useCallTimer(stage.connectedAt);
  const small = minimised && !isMobile;
  const isVideo = stage.type === 'video';
  const remoteHasVideo = isVideo && Boolean(remoteStream?.getVideoTracks().length);
  const name = stage.peerName || 'Clarke member';
  const status = stage.status === 'Connected' && duration ? duration : stage.status;
  const hangup = () => endCall(true);

  // The remote video element also plays the call audio, so it stays mounted (hidden) for voice calls.
  useEffect(() => {
    if (remoteRef.current) remoteRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  return createPortal(
    <div className={`call-layer${small ? ' is-minimised' : ''}`}>
      <section
        className={`call-stage${remoteHasVideo ? ' has-video' : ''}`}
        role="dialog"
        aria-label={`${isVideo ? 'Video' : 'Voice'} call with ${name}`}
      >
        <video
          id="remoteVideo"
          className={`call-remote${remoteHasVideo ? '' : ' is-hidden'}`}
          ref={remoteRef}
          autoPlay
          playsInline
        ></video>
        <header className="call-top">
          {remoteHasVideo && (
            <div className="call-top-info">
              <b className="truncate">{name}</b>
              <span aria-live="polite">{status}</span>
            </div>
          )}
          {!isMobile && (
            <button
              type="button"
              className="call-round call-round-sm call-minimise"
              aria-label="Minimise call"
              onClick={() => setMinimised(true)}
            >
              <Minimize2 size={20} aria-hidden="true" />
            </button>
          )}
        </header>
        {!remoteHasVideo && (
          <div className="call-info">
            <Avatar src={stage.peerAvatar} name={name} size="xxl" />
            <h2 className="truncate">{name}</h2>
            <p className="call-sub" aria-live="polite">
              {status}
            </p>
          </div>
        )}
        <LocalPreview stream={localStream} hidden={!isVideo} />
        <CallControls type={stage.type} localStream={localStream} mediaRef={remoteRef} onHangup={hangup} />
      </section>
      {small && (
        <div className="call-pill" role="region" aria-label="Ongoing call">
          <button
            type="button"
            className="call-pill-main"
            onClick={() => setMinimised(false)}
            aria-label={`Expand call with ${name}`}
          >
            <Avatar src={stage.peerAvatar} name={name} size="sm" />
            <span className="call-pill-text">
              <b className="truncate">{name}</b>
              <span>{status}</span>
            </span>
          </button>
          <button
            type="button"
            className="call-round call-round-end call-round-sm"
            aria-label="End call"
            onClick={hangup}
          >
            <PhoneOff size={20} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>,
    document.body
  );
}
