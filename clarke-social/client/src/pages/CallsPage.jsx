import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useCalls } from '../context/CallContext';
import CallStage from '../components/CallStage';
import ViewHeading from '../components/ViewHeading';
import { callHistory } from '../services/callsService';

function CallHistory() {
  const { user } = useAuth();
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    if (!user) return;
    callHistory()
      .then(({ calls }) => setState({ calls }))
      .catch((e) => setState({ error: e.message }));
  }, [user]);

  let content;
  if (!user) content = 'Sign in to view your call history.';
  else if (state.loading) content = 'Loading…';
  else if (state.error) content = state.error;
  else if (!state.calls.length) content = <p>No calls yet.</p>;
  else
    content = state.calls.map((c) => (
      <div className="settings-row" key={c.call_id}>
        <span>
          <b>
            {c.peer_name || c.peer_username} · {c.call_type}
          </b>
          <small>
            {c.direction} · {c.status} · {c.started_at}
          </small>
        </span>
      </div>
    ));
  return <div id="callHistory">{content}</div>;
}

export default function CallsPage() {
  const { user } = useAuth();
  const { openAuth } = useNavigation();
  const { stage, localStream, remoteStream, startCall, endCall } = useCalls();
  const targetRef = useRef(null);

  const onStart = (type) => {
    if (!user) return openAuth();
    startCall(type, Number(targetRef.current.value));
  };

  return (
    <>
      <ViewHeading title="Voice & video calls" subtitle="Call a Clarke member using their numeric account ID." />
      <div className="card-panel" style={{ padding: 18 }}>
        <label style={{ display: 'block', fontWeight: 700, fontSize: 11, marginBottom: 8 }}>Member account ID</label>
        <input
          id="callTarget"
          ref={targetRef}
          type="number"
          min="1"
          placeholder="Enter member ID"
          style={{ padding: 12, border: '1px solid var(--line)', borderRadius: 9, width: '100%', outline: 0 }}
        />
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button className="btn btn-primary" id="startVideo" onClick={() => onStart('video')}>
            Start video call
          </button>
          <button
            className="btn"
            style={{ background: '#edf3ff', color: 'var(--blue)' }}
            id="startAudio"
            onClick={() => onStart('audio')}
          >
            Voice call
          </button>
        </div>
        <p style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.6, marginTop: 14 }}>
          Calls require camera/microphone permission and a secure HTTPS connection when deployed. A STUN server is
          configured for development; production requires TURN infrastructure for reliable connections.
        </p>
      </div>
      <div id="callArea" style={{ marginTop: 16 }}>
        {stage && (
          <CallStage
            type={stage.type}
            status={stage.status}
            localStream={localStream}
            remoteStream={remoteStream}
            onHangup={() => endCall(true)}
          />
        )}
      </div>
      <div className="card-panel" style={{ padding: 18, marginTop: 16 }}>
        <h3>Recent calls</h3>
        <CallHistory />
      </div>
    </>
  );
}
