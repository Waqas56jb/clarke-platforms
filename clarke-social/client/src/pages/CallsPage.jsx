import { useRef } from 'react';
import { Phone, Video } from 'lucide-react';
import CallContacts from '../components/calls/CallContacts';
import CallHistory from '../components/calls/CallHistory';
import { useCalls } from '../context/CallContext';

function CallById({ onCall }) {
  const targetRef = useRef(null);
  const call = (type) => onCall(type, Number(targetRef.current.value));
  return (
    <details className="card card-pad call-by-id">
      <summary>Call by member ID</summary>
      <div className="stack call-by-id-body">
        <label className="field">
          <span className="field-label">Member account ID</span>
          <input id="callTarget" ref={targetRef} type="number" min="1" inputMode="numeric" placeholder="e.g. 42" />
        </label>
        <div className="row-wrap">
          <button type="button" className="btn btn-primary" id="startVideo" onClick={() => call('video')}>
            <Video size={20} aria-hidden="true" />
            Video call
          </button>
          <button type="button" className="btn btn-secondary" id="startAudio" onClick={() => call('audio')}>
            <Phone size={20} aria-hidden="true" />
            Voice call
          </button>
        </div>
      </div>
    </details>
  );
}

export default function CallsPage() {
  const { stage, startCall } = useCalls();

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Calls</h1>
          <p>Voice and video calls with your matches and members who follow you back.</p>
        </div>
      </header>

      <section className="card card-pad" aria-labelledby="callContactsTitle">
        <div className="card-head">
          <h2 className="card-title" id="callContactsTitle">
            People you can call
          </h2>
        </div>
        <CallContacts onCall={startCall} />
      </section>

      <section className="card card-pad section" aria-labelledby="callHistoryTitle">
        <div className="card-head">
          <h2 className="card-title" id="callHistoryTitle">
            Recent calls
          </h2>
        </div>
        <CallHistory refreshKey={stage ? 'live' : 'idle'} onCall={startCall} />
      </section>

      <div className="section">
        <CallById onCall={startCall} />
      </div>

      <p className="fine-print">
        Calls need microphone (and camera for video) permission. Audio and video go directly between you and the other
        member, relayed through a TURN server when your networks require it.
      </p>
    </>
  );
}
