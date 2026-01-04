export interface ServerToClientEvents {
  'user-joined': (peerId: string) => void;
  'user-left': (peerId: string) => void;
  'offer': (data: { offer: RTCSessionDescriptionInit; from: string }) => void;
  'answer': (data: { answer: RTCSessionDescriptionInit; from: string }) => void;
  'ice-candidate': (data: {
    candidate: RTCIceCandidateInit;
    from: string;
  }) => void;
}

export interface ClientToServerEvents {
  'join-room': (roomId: string) => void;
  'offer': (data: { offer: RTCSessionDescriptionInit; to: string }) => void;
  'answer': (data: { answer: RTCSessionDescriptionInit; to: string }) => void;
  'ice-candidate': (data: {
    candidate: RTCIceCandidateInit;
    to: string;
  }) => void;
  'leave-room': () => void;
}
