import { useRef } from 'react';
import { useCalls } from '../context/CallContext';
import CallStage from '../components/CallStage';
import Avatar from '../components/Avatar';
import { AsyncView } from '../components/StateView';
import ViewHeading from '../components/ViewHeading';
import { useAsync } from '../hooks/useAsync';
import { callHistory } from '../services/callsService';
import { listContacts } from '../services/messagesService';
import { formatDateTime } from '../utils/format';

const STATUS_TEXT = {
  ringing: 'ringing',
  answered: 'in progress',
  declined: 'declined',
  missed: 'missed',
  ended: 'ended',
  failed: 'failed',
};

function CallHistory({ refreshKey }) {
  const state = useAsync(() => callHistory().then((d) => d.calls), [refreshKey]);
  return (
    <div id="callHistory">
      <AsyncView state={state} loadingText="Loading…">
        {(calls) =>
          calls.length ? (
            calls.map((c) => (
              <div className="settings-row" key={c.call_id}>
                <span>
                  <b>
                    {c.peer_name || c.peer_username} · {c.call_type}
                  </b>
                  <small>
                    {c.direction} · {STATUS_TEXT[c.status]} · {formatDateTime(c.started_at)}
                  </small>
                </span>
              </div>
            ))
          ) : (
            <p>No calls yet.</p>
          )
        }
      </AsyncView>
    </div>
  );
}

function QuickCall({ onCall }) {
  const state = useAsync(() => listContacts().then((d) => d.contacts), []);
  if (!state.data?.length) return null;
  return (
    <div style={{ marginTop: 14 }}>
      <label style={{ display: 'block', fontWeight: 700, fontSize: 11, marginBottom: 4 }}>People you can call</label>
      {state.data.slice(0, 8).map((u) => (
        <div className="person-row" key={u.id}>
          <Avatar src={u.avatar} name={u.displayName} />
          <div className="person-info">
            <b>{u.displayName}</b>
            <small>
              @{u.username} · ID {u.id}
            </small>
          </div>
          <button className="follow-btn" onClick={() => onCall('audio', u)}>
            Call
          </button>
          <button className="follow-btn" onClick={() => onCall('video', u)}>
            Video
          </button>
        </div>
      ))}
    </div>
  );
}

export default function CallsPage() {
  const { stage, localStream, remoteStream, startCall, endCall } = useCalls();
  const targetRef = useRef(null);

  return (
    <>
      <ViewHeading title="Voice & video calls" subtitle="Call your matches and members who follow you back." />
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
          <button
            className="btn btn-primary"
            id="startVideo"
            onClick={() => startCall('video', Number(targetRef.current.value))}
          >
            Start video call
          </button>
          <button
            className="btn"
            style={{ background: '#edf3ff', color: 'var(--blue)' }}
            id="startAudio"
            onClick={() => startCall('audio', Number(targetRef.current.value))}
          >
            Voice call
          </button>
        </div>
        <QuickCall onCall={(type, u) => startCall(type, u.id, u.displayName)} />
        <p style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.6, marginTop: 14 }}>
          Calls need camera/microphone permission. Audio and video go directly between you and the other member, and are
          relayed through a TURN server when your networks require it.
        </p>
      </div>
      <div id="callArea" style={{ marginTop: 16 }}>
        {stage && (
          <CallStage
            type={stage.type}
            status={stage.peerName ? `${stage.status} · ${stage.peerName}` : stage.status}
            localStream={localStream}
            remoteStream={remoteStream}
            onHangup={() => endCall(true)}
          />
        )}
      </div>
      <div className="card-panel" style={{ padding: 18, marginTop: 16 }}>
        <h3>Recent calls</h3>
        <CallHistory refreshKey={stage ? 'live' : 'idle'} />
      </div>
    </>
  );
}
