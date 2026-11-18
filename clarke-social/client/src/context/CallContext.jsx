// One-to-one WebRTC calls. Signalling goes over the member's direct Socket.IO connection; media flows
// peer-to-peer, relayed through TURN when the server provides TURN credentials.
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useSocket, useSocketEvent } from './SocketContext';
import { iceConfig } from '../services/callsService';

const CallContext = createContext(null);

const CAMERA_UNAVAILABLE = new Set(['NotFoundError', 'NotReadableError', 'OverconstrainedError']);

// Video calls continue with audio only when the device has no usable camera.
async function openMedia(type, toast) {
  try {
    return await navigator.mediaDevices.getUserMedia({ audio: true, video: type === 'video' });
  } catch (err) {
    if (type !== 'video' || !CAMERA_UNAVAILABLE.has(err.name)) throw mediaError(err);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch((e) => {
      throw mediaError(e);
    });
    toast('No camera is available, so you joined with audio only.');
    return stream;
  }
}

function mediaError(err) {
  if (err.name === 'NotAllowedError')
    return new Error('Allow microphone (and camera for video) access in your browser settings to make calls.');
  if (err.name === 'NotFoundError') return new Error('No microphone was found on this device.');
  return err;
}

async function addIce(peer, candidate) {
  try {
    await peer.addIceCandidate(new RTCIceCandidate(candidate));
  } catch {
    // Late or duplicate candidates are expected and safe to ignore.
  }
}

export function CallProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const socket = useSocket();
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const callRef = useRef({ peer: null, callId: null });
  // ICE candidates that arrive before the remote description is set are queued, not dropped.
  const pendingIceRef = useRef([]);
  const [stage, setStage] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  // The ringing call waiting for the member to accept or decline: the 'call:incoming' payload.
  const [incoming, setIncoming] = useState(null);

  const endCall = useCallback(
    (notify = true) => {
      const { peer, callId } = callRef.current;
      if (notify && socket && peer) socket.emit('call:end', { to: peer, callId });
      peerRef.current?.close();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      peerRef.current = null;
      localStreamRef.current = null;
      pendingIceRef.current = [];
      callRef.current = { peer: null, callId: null };
      setLocalStream(null);
      setRemoteStream(null);
      setStage(null);
    },
    [socket]
  );

  const createPeer = useCallback(
    async (to, callId, type) => {
      callRef.current = { peer: to, callId };
      const { iceServers } = await iceConfig();
      const stream = await openMedia(type, toast);
      localStreamRef.current = stream;
      setLocalStream(stream);
      const peer = new RTCPeerConnection({ iceServers });
      peerRef.current = peer;
      stream.getTracks().forEach((t) => peer.addTrack(t, stream));
      peer.onicecandidate = (e) => {
        if (e.candidate) socket.emit('call:ice', { to, candidate: e.candidate, callId });
      };
      peer.ontrack = (e) => setRemoteStream(e.streams[0]);
      peer.onconnectionstatechange = () => {
        if (peer.connectionState === 'connected')
          setStage((s) => s && { ...s, status: 'Connected', connectedAt: s.connectedAt || Date.now() });
        if (peer.connectionState === 'failed') toast('Call connection ended or lost.', 'error');
      };
      return peer;
    },
    [socket, toast]
  );

  const flushPendingIce = useCallback(async (peer) => {
    const queued = pendingIceRef.current;
    pendingIceRef.current = [];
    for (const candidate of queued) await addIce(peer, candidate);
  }, []);

  const acceptCall = useCallback(
    async (data) => {
      try {
        const peer = await createPeer(data.from, data.callId, data.callType);
        await peer.setRemoteDescription(new RTCSessionDescription(data.offer));
        await flushPendingIce(peer);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit('call:answer', { to: data.from, answer, callId: data.callId });
        setStage({
          callId: data.callId,
          type: data.callType,
          status: 'Connecting…',
          peerId: data.from,
          peerName: data.displayName || data.username,
          peerUsername: data.username,
          peerAvatar: data.avatar,
        });
      } catch (e) {
        socket.emit('call:decline', { to: data.from, callId: data.callId });
        endCall(false);
        toast(e.message || 'Could not answer call.', 'error');
      }
    },
    [createPeer, flushPendingIce, socket, toast, endCall]
  );

  const acceptIncoming = useCallback(() => {
    if (!incoming) return;
    setIncoming(null);
    acceptCall(incoming);
  }, [incoming, acceptCall]);

  const declineIncoming = useCallback(() => {
    if (!incoming) return;
    socket?.emit('call:decline', { to: incoming.from, callId: incoming.callId });
    setIncoming(null);
  }, [incoming, socket]);

  useSocketEvent('call:error', (d) => {
    toast(d.message || 'Call could not be started.', 'error');
    endCall(false);
  });
  useSocketEvent('call:incoming', (data) => {
    // Busy: already in a call or another call is ringing.
    if (callRef.current.callId || incoming) {
      socket.emit('call:decline', { to: data.from, callId: data.callId });
      return;
    }
    pendingIceRef.current = [];
    setIncoming(data);
  });
  useSocketEvent('call:answered', async (d) => {
    const peer = peerRef.current;
    if (!peer || !d.answer) return;
    setStage((s) => s && { ...s, status: 'Connecting…' });
    await peer.setRemoteDescription(new RTCSessionDescription(d.answer));
    await flushPendingIce(peer);
  });
  useSocketEvent('call:ice', async (d) => {
    if (!d.candidate || (d.callId !== callRef.current.callId && callRef.current.callId)) return;
    const peer = peerRef.current;
    if (!peer?.remoteDescription) {
      pendingIceRef.current.push(d.candidate);
      return;
    }
    await addIce(peer, d.candidate);
  });
  useSocketEvent('call:ended', (d) => {
    if (incoming && d?.callId === incoming.callId) {
      setIncoming(null);
      toast(`Missed call from ${incoming.displayName || incoming.username}.`);
      return;
    }
    toast('The call has ended.');
    endCall(false);
  });
  useSocketEvent('call:declined', () => {
    toast('Call declined.');
    endCall(false);
  });

  const startCall = useCallback(
    async (type, to, peerName, peerAvatar) => {
      if (!socket?.connected) return toast('Calling is reconnecting. Please try again in a moment.', 'warning');
      if (!to || to === user?.id) return toast('Enter another member account ID.', 'warning');
      if (callRef.current.callId) return toast('You are already in a call.', 'warning');
      try {
        const callId = crypto.randomUUID();
        const peer = await createPeer(to, callId, type);
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit('call:invite', { to, offer, callType: type, callId });
        setStage({ callId, type, status: 'Calling…', peerId: to, peerName, peerAvatar });
      } catch (e) {
        endCall(false);
        toast(e.message || 'Could not access your camera or microphone.', 'error');
      }
    },
    [createPeer, socket, toast, user, endCall]
  );

  return (
    <CallContext.Provider
      value={{
        stage,
        localStream,
        remoteStream,
        startCall,
        endCall,
        incoming,
        acceptIncoming,
        declineIncoming,
      }}
    >
      {children}
    </CallContext.Provider>
  );
}

export const useCalls = () => useContext(CallContext);
