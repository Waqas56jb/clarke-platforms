// Global call layer, always mounted: the incoming-call prompt and the active call screen.
// Calls keep running while the member moves around the app.
import { useCalls } from '../../context/CallContext';
import ActiveCall from './ActiveCall';
import IncomingCall from './IncomingCall';

export default function CallOverlay() {
  const { stage, incoming } = useCalls();
  return (
    <>
      {incoming && <IncomingCall call={incoming} />}
      {stage && <ActiveCall key={stage.callId} stage={stage} />}
    </>
  );
}
