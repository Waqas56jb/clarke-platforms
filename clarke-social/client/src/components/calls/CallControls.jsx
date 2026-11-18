import { useState } from 'react';
import { Mic, MicOff, PhoneOff, Video, VideoOff, Volume2 } from 'lucide-react';
import { useAudioOutputs } from './useAudioOutputs';

function ControlButton({ id, label, pressed, disabled, onClick, children, caption }) {
  return (
    <div className="call-action">
      <button
        type="button"
        id={id}
        className="call-round"
        aria-label={label}
        aria-pressed={pressed}
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </button>
      <span aria-hidden="true">{caption}</span>
    </div>
  );
}

// Offered only when the browser can route call audio and there is more than one output.
// Each press moves the call audio to the next device.
function SpeakerButton({ mediaRef }) {
  const outputs = useAudioOutputs();
  const [index, setIndex] = useState(0);
  if (!outputs.length) return null;

  const current = outputs[index % outputs.length];
  const next = () => {
    const nextIndex = (index + 1) % outputs.length;
    mediaRef.current
      ?.setSinkId(outputs[nextIndex].deviceId)
      .then(() => setIndex(nextIndex))
      .catch(() => {});
  };
  return (
    <ControlButton
      label={`Switch audio output, now ${current.label || `output ${index + 1}`}`}
      caption="Speaker"
      onClick={next}
    >
      <Volume2 size={24} aria-hidden="true" />
    </ControlButton>
  );
}

export default function CallControls({ type, localStream, mediaRef, onHangup }) {
  const [micOff, setMicOff] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const audioTrack = localStream?.getAudioTracks()[0];
  const videoTrack = localStream?.getVideoTracks()[0];

  const toggle = (track, setOff) => {
    if (!track) return;
    track.enabled = !track.enabled;
    setOff(!track.enabled);
  };

  return (
    <div className="call-controls">
      <ControlButton
        id="muteCall"
        label="Mute microphone"
        pressed={micOff}
        disabled={!audioTrack}
        caption={micOff ? 'Unmute' : 'Mute'}
        onClick={() => toggle(audioTrack, setMicOff)}
      >
        {micOff ? <MicOff size={24} aria-hidden="true" /> : <Mic size={24} aria-hidden="true" />}
      </ControlButton>
      {type === 'video' && (
        <ControlButton
          id="cameraCall"
          label="Turn off camera"
          pressed={cameraOff}
          disabled={!videoTrack}
          caption={cameraOff ? 'Camera on' : 'Camera off'}
          onClick={() => toggle(videoTrack, setCameraOff)}
        >
          {cameraOff ? <VideoOff size={24} aria-hidden="true" /> : <Video size={24} aria-hidden="true" />}
        </ControlButton>
      )}
      <SpeakerButton mediaRef={mediaRef} />
      <div className="call-action">
        <button
          type="button"
          id="hangupCall"
          className="call-round call-round-end"
          aria-label="End call"
          onClick={onHangup}
        >
          <PhoneOff size={26} aria-hidden="true" />
        </button>
        <span aria-hidden="true">End</span>
      </div>
    </div>
  );
}
