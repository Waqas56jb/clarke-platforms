// One-to-one WebRTC calls. For reliable production use, configure TURN and a group-call SFU.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useNavigation } from './NavigationContext';
import { iceConfig } from '../services/callsService';

const CallContext = createContext(null);

// Vercel rewrites cannot proxy WebSockets, so builds served from Vercel use HTTP long-polling only.
const SOCKET_OPTIONS = import.meta.env.VITE_SOCKET_POLLING_ONLY === 'true' ? { transports: ['polling'] } : {};

export function CallProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const { navigate } = useNavigation();
  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const callRef = useRef({ peer: null, callId: null });
  const rtcConfig = useRef({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
  const [stage, setStage] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    iceConfig()
      .then(({ iceServers }) => {
        rtcConfig.current.iceServers = iceServers;
      })
      .catch(() => {});
  }, []);

  const endCall = useCallback((notify = true) => {
    const { peer, callId } = callRef.current;
    if (notify && socketRef.current && peer) socketRef.current.emit('call:end', { to: peer, callId });
    peerRef.current?.close();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    peerRef.current = null;
    localStreamRef.current = null;
    callRef.current = { peer: null, callId: null };
    setLocalStream(null);
    setRemoteStream(null);
    setStage(null);
  }, []);

  const createPeer = useCallback(async (to, callId, type) => {
    callRef.current = { peer: to, callId };
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: type === 'video' });
    localStreamRef.current = stream;
    setLocalStream(stream);
    const peer = new RTCPeerConnection(rtcConfig.current);
    peerRef.current = peer;
    stream.getTracks().forEach((t) => peer.addTrack(t, stream));
    peer.onicecandidate = (e) => {
      if (e.candidate) socketRef.current.emit('call:ice', { to, candidate: e.candidate, callId });
    };
    peer.ontrack = (e) => setRemoteStream(e.streams[0]);
    return peer;
  }, []);

  const acceptCall = useCallback(
    async (data) => {
      try {
        const peer = await createPeer(data.from, data.callId, data.callType);
        await peer.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socketRef.current.emit('call:answer', { to: data.from, answer, callId: data.callId });
        navigate('calls');
        setStage({ type: data.callType, status: 'Connected' });
      } catch (e) {
        toast(e.message || 'Could not answer call.');
      }
    },
    [createPeer, navigate, toast]
  );

  const userId = user?.id;
  useEffect(() => {
    if (!userId) return undefined;
    const socket = io(SOCKET_OPTIONS);
    socketRef.current = socket;
    socket.on('connect_error', () => {});
    socket.on('call:error', (d) => {
      toast(d.message || 'Call could not be started.');
      endCall(false);
    });
    socket.on('call:ringing', (d) => {
      callRef.current.callId = d.callId;
    });
    socket.on('call:incoming', async (data) => {
      const accept = window.confirm(`${data.username} is calling you (${data.callType}). Accept?`);
      if (accept) await acceptCall(data);
      else socket.emit('call:decline', { to: data.from, callId: data.callId });
    });
    socket.on('call:answered', async (d) => {
      if (peerRef.current && d.answer) await peerRef.current.setRemoteDescription(new RTCSessionDescription(d.answer));
    });
    socket.on('call:ice', async (d) => {
      if (peerRef.current && d.candidate) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(d.candidate));
        } catch {
          // Late or duplicate candidates are expected and safe to ignore.
        }
      }
    });
    socket.on('call:ended', () => endCall(false));
    socket.on('call:declined', () => {
      toast('Call declined.');
      endCall(false);
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, acceptCall, endCall, toast]);

  const startCall = useCallback(
    async (type, to) => {
      if (!socketRef.current?.connected) return toast('Call signalling is not connected. Sign in again.');
      if (!to || to === userId) return toast('Enter another member account ID.');
      try {
        const callId = crypto.randomUUID();
        const peer = await createPeer(to, callId, type);
        peer.onconnectionstatechange = () => {
          if (['failed', 'disconnected', 'closed'].includes(peerRef.current?.connectionState))
            toast('Call connection ended or lost.');
        };
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socketRef.current.emit('call:invite', { to, offer, callType: type, callId });
        setStage({ type, status: 'Calling…' });
      } catch (e) {
        toast(e.message || 'Could not access your camera or microphone.');
      }
    },
    [createPeer, toast, userId]
  );

  return (
    <CallContext.Provider value={{ stage, localStream, remoteStream, startCall, endCall }}>
      {children}
    </CallContext.Provider>
  );
}

export const useCalls = () => useContext(CallContext);
