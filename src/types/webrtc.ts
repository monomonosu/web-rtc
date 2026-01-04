export interface MediaState {
  audio: boolean;
  video: boolean;
}

export interface PeerConnection {
  peerConnection: RTCPeerConnection;
  remoteStream: MediaStream | null;
  peerId: string;
}

export type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'failed';

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  iceCandidatePoolSize?: number;
}

export interface MediaConstraints {
  video: MediaTrackConstraints;
  audio: MediaTrackConstraints;
}
