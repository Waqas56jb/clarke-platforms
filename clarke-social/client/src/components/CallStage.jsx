import { useEffect, useRef, useState } from 'react';

const videoBase = { background: '#071a3d' };

export default function CallStage({ type, status, localStream, remoteStream, onHangup }) {
  const remoteRef = useRef(null);
  const localRef = useRef(null);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const hideForAudio = type === 'audio' ? { display: 'none' } : {};

  useEffect(() => {
    if (remoteRef.current) remoteRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  useEffect(() => {
    if (localRef.current && localStream) localRef.current.srcObject = localStream;
  }, [localStream]);

  const toggleTrack = (track, setOn) => {
    if (!track) return;
    track.enabled = !track.enabled;
    setOn(track.enabled);
  };

  return (
    <div className="call-stage">
      <h2>{type === 'video' ? 'Video call' : 'Voice call'}</h2>
      <p>{status}</p>
      <video
        id="remoteVideo"
        ref={remoteRef}
        autoPlay
        playsInline
        style={{ ...videoBase, width: '100%', maxHeight: 300, borderRadius: 12, ...hideForAudio }}
      ></video>
      <video
        id="localVideo"
        ref={localRef}
        autoPlay
        muted
        playsInline
        style={{
          ...videoBase,
          width: 100,
          height: 75,
          objectFit: 'cover',
          borderRadius: 9,
          marginTop: 10,
          ...hideForAudio,
        }}
      ></video>
      <div className="call-controls">
        <button
          id="muteCall"
          title="Mute microphone"
          style={{ opacity: micOn ? 1 : 0.45 }}
          onClick={() => toggleTrack(localStream?.getAudioTracks()[0], setMicOn)}
        >
          ♩ Mute
        </button>
        {type === 'video' && (
          <button
            id="cameraCall"
            title="Toggle camera"
            style={{ opacity: cameraOn ? 1 : 0.45 }}
            onClick={() => toggleTrack(localStream?.getVideoTracks()[0], setCameraOn)}
          >
            ◉ Camera
          </button>
        )}
        <button id="hangupCall" className="hangup" title="End call" onClick={onHangup}>
          ×
        </button>
      </div>
      <div className="call-status">{status} · Clarke calling</div>
    </div>
  );
}
