import { Phone, PhoneIncoming, PhoneMissed, PhoneOutgoing, Video } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { callHistory } from '../../services/callsService';
import { formatSeconds } from '../../utils/format';
import { AsyncView, EmptyState } from '../StateView';

const UNANSWERED = new Set(['missed', 'declined', 'failed', 'ringing']);

function describe(call) {
  if (call.direction === 'incoming' && call.status === 'missed')
    return { Icon: PhoneMissed, text: 'Missed', missed: true };
  if (call.direction === 'incoming' && call.status === 'declined')
    return { Icon: PhoneMissed, text: 'Declined', missed: true };
  if (call.direction === 'incoming') return { Icon: PhoneIncoming, text: 'Incoming' };
  const text = UNANSWERED.has(call.status)
    ? `Outgoing · ${call.status === 'ringing' ? 'ringing' : 'not answered'}`
    : 'Outgoing';
  return { Icon: PhoneOutgoing, text };
}

const callLength = (call) =>
  call.answered_at && call.ended_at
    ? formatSeconds(Math.max(0, new Date(call.ended_at) - new Date(call.answered_at)) / 1000)
    : '';

const formatWhen = (value) =>
  new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

function HistoryRow({ call, onCall }) {
  const { Icon, text, missed } = describe(call);
  const name = call.peer_name || call.peer_username;
  const TypeIcon = call.call_type === 'video' ? Video : Phone;
  const length = callLength(call);
  return (
    <li className="list-row call-row">
      <span className={`call-dir${missed ? ' is-missed' : ''}`}>
        <Icon size={20} aria-hidden="true" />
      </span>
      <div className="list-row-main">
        <span className={`list-row-title${missed ? ' call-missed' : ''}`}>{name}</span>
        <span className="list-row-sub row">
          <TypeIcon size={16} aria-label={call.call_type === 'video' ? 'Video call' : 'Voice call'} />
          <span className="truncate">
            {text} · {formatWhen(call.started_at)}
            {length && ` · ${length}`}
          </span>
        </span>
      </div>
      <button
        type="button"
        className="icon-btn"
        aria-label={`Call ${name} back (${call.call_type === 'video' ? 'video' : 'voice'})`}
        onClick={() => onCall(call.call_type, call.peer_id, name)}
      >
        <TypeIcon size={20} aria-hidden="true" />
      </button>
    </li>
  );
}

export default function CallHistory({ refreshKey, onCall }) {
  const state = useAsync(() => callHistory().then((d) => d.calls), [refreshKey]);
  return (
    <div id="callHistory">
      <AsyncView
        state={state}
        skeleton="list"
        count={4}
        loadingText="Loading call history"
        errorTitle="Couldn't load your calls"
      >
        {(calls) =>
          calls.length ? (
            <ul className="call-list">
              {calls.map((c) => (
                <HistoryRow key={c.call_id} call={c} onCall={onCall} />
              ))}
            </ul>
          ) : (
            <EmptyState icon={Phone} title="No call history yet." plain />
          )
        }
      </AsyncView>
    </div>
  );
}
