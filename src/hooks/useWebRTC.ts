'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { rtcConfig } from '../lib/webrtc/config';
import type { PeerConnection, ConnectionStatus } from '../types/webrtc';
import type { Socket } from 'socket.io-client';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '../types/socket';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface UseWebRTCProps {
  roomId: string | null;
  localStream: MediaStream | null;
  socket: TypedSocket | null;
  isSocketConnected: boolean;
}

export const useWebRTC = ({
  roomId,
  localStream,
  socket,
  isSocketConnected,
}: UseWebRTCProps) => {
  const [peers, setPeers] = useState<Map<string, PeerConnection>>(new Map());
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('idle');
  const peersRef = useRef<Map<string, PeerConnection>>(new Map());

  // Keep ref in sync with state
  useEffect(() => {
    peersRef.current = peers;
  }, [peers]);

  // Create a peer connection for a specific peer
  const createPeerConnection = useCallback(
    (peerId: string): RTCPeerConnection => {
      console.log('Creating peer connection for:', peerId);

      const peerConnection = new RTCPeerConnection(rtcConfig);

      // Add local tracks to peer connection
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStream);
          console.log(`Added ${track.kind} track to peer ${peerId}`);
        });
      }

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket) {
          console.log('Sending ICE candidate to:', peerId);
          socket.emit('ice-candidate', {
            candidate: event.candidate,
            to: peerId,
          });
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log(
          `Peer ${peerId} connection state:`,
          peerConnection.connectionState
        );

        if (peerConnection.connectionState === 'connected') {
          setConnectionStatus('connected');
        } else if (peerConnection.connectionState === 'failed') {
          setConnectionStatus('failed');
        } else if (peerConnection.connectionState === 'disconnected') {
          setConnectionStatus('disconnected');
        }
      };

      // Handle incoming tracks
      peerConnection.ontrack = (event) => {
        console.log('Received remote track from:', peerId, event.track.kind);
        const [remoteStream] = event.streams;

        setPeers((prev) => {
          const updated = new Map(prev);
          const existing = updated.get(peerId);
          if (existing) {
            updated.set(peerId, {
              ...existing,
              remoteStream,
            });
          }
          return updated;
        });
      };

      return peerConnection;
    },
    [localStream, socket]
  );

  // Handle creating and sending an offer
  const createOffer = useCallback(
    async (peerId: string) => {
      const pc = createPeerConnection(peerId);

      // Store peer connection
      setPeers((prev) => {
        const updated = new Map(prev);
        updated.set(peerId, {
          peerConnection: pc,
          remoteStream: null,
          peerId,
        });
        return updated;
      });

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        if (socket) {
          console.log('Sending offer to:', peerId);
          socket.emit('offer', { offer, to: peerId });
        }
      } catch (error) {
        console.error('Error creating offer:', error);
      }
    },
    [createPeerConnection, socket]
  );

  // Join a room
  const joinRoom = useCallback(
    (targetRoomId: string) => {
      if (socket && isSocketConnected) {
        console.log('Joining room:', targetRoomId);
        setConnectionStatus('connecting');
        socket.emit('join-room', targetRoomId);
      }
    },
    [socket, isSocketConnected]
  );

  // Leave room and cleanup
  const leaveRoom = useCallback(() => {
    console.log('Leaving room and cleaning up connections');

    // Close all peer connections
    peersRef.current.forEach((peer, peerId) => {
      console.log('Closing connection to:', peerId);
      peer.peerConnection.close();
    });

    setPeers(new Map());
    setConnectionStatus('idle');

    if (socket) {
      socket.emit('leave-room');
    }
  }, [socket]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket || !localStream) return;

    // Handle new user joining
    const handleUserJoined = (peerId: string) => {
      console.log('User joined:', peerId);
      createOffer(peerId);
    };

    // Handle receiving an offer
    const handleOffer = async ({
      offer,
      from,
    }: {
      offer: RTCSessionDescriptionInit;
      from: string;
    }) => {
      console.log('Received offer from:', from);

      const pc = createPeerConnection(from);

      // Store peer connection
      setPeers((prev) => {
        const updated = new Map(prev);
        updated.set(from, {
          peerConnection: pc,
          remoteStream: null,
          peerId: from,
        });
        return updated;
      });

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('answer', { answer, to: from });
        console.log('Sent answer to:', from);
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    };

    // Handle receiving an answer
    const handleAnswer = async ({
      answer,
      from,
    }: {
      answer: RTCSessionDescriptionInit;
      from: string;
    }) => {
      console.log('Received answer from:', from);

      const peer = peersRef.current.get(from);
      if (peer) {
        try {
          await peer.peerConnection.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
        } catch (error) {
          console.error('Error setting remote description:', error);
        }
      }
    };

    // Handle ICE candidate
    const handleIceCandidate = async ({
      candidate,
      from,
    }: {
      candidate: RTCIceCandidateInit;
      from: string;
    }) => {
      console.log('Received ICE candidate from:', from);

      const peer = peersRef.current.get(from);
      if (peer) {
        try {
          await peer.peerConnection.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        } catch (error) {
          console.error('Error adding ICE candidate:', error);
        }
      }
    };

    // Handle user leaving
    const handleUserLeft = (peerId: string) => {
      console.log('User left:', peerId);

      const peer = peersRef.current.get(peerId);
      if (peer) {
        peer.peerConnection.close();
        setPeers((prev) => {
          const updated = new Map(prev);
          updated.delete(peerId);
          return updated;
        });
      }
    };

    // Register event listeners
    socket.on('user-joined', handleUserJoined);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('user-left', handleUserLeft);

    // Cleanup
    return () => {
      socket.off('user-joined', handleUserJoined);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('user-left', handleUserLeft);
    };
  }, [socket, localStream, createPeerConnection, createOffer]);

  // Auto-join room when ready
  useEffect(() => {
    if (roomId && socket && isSocketConnected && localStream) {
      joinRoom(roomId);
    }

    // Cleanup on unmount
    return () => {
      leaveRoom();
    };
  }, [roomId, socket, isSocketConnected, localStream, joinRoom, leaveRoom]);

  return {
    peers,
    connectionStatus,
    joinRoom,
    leaveRoom,
  };
};
