'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSocket } from '../../../hooks/useSocket';
import { useMediaStream } from '../../../hooks/useMediaStream';
import { useWebRTC } from '../../../hooks/useWebRTC';
import { VideoPlayer } from '../../../components/VideoChat/VideoPlayer';
import { Controls } from '../../../components/VideoChat/Controls';
import { ConnectionStatus } from '../../../components/VideoChat/ConnectionStatus';
import { RoomInfo } from '../../../components/VideoChat/RoomInfo';

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params?.roomId as string;

  // Initialize hooks
  const { socket, isConnected: socketConnected } = useSocket();
  const {
    localStream,
    mediaState,
    error: mediaError,
    isInitializing,
    initializeMedia,
    toggleAudio,
    toggleVideo,
  } = useMediaStream();

  const { peers, connectionStatus, leaveRoom } = useWebRTC({
    roomId,
    localStream,
    socket,
    isSocketConnected: socketConnected,
  });

  // Initialize media on mount
  useEffect(() => {
    initializeMedia();
  }, [initializeMedia]);

  // Handle leaving room
  const handleLeaveRoom = () => {
    leaveRoom();
    router.push('/');
  };

  // Show error state
  if (mediaError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-md w-full mx-4">
          <div className="bg-red-900 border border-red-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <svg
                className="w-6 h-6 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-xl font-bold text-white">エラー</h2>
            </div>
            <p className="text-red-200 mb-4">{mediaError}</p>
            <div className="flex gap-2">
              <button
                onClick={initializeMedia}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                再試行
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                ホームに戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isInitializing || !localStream) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">メディアデバイスを初期化中...</p>
        </div>
      </div>
    );
  }

  const remotePeers = Array.from(peers.values());

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">ビデオチャット</h1>
            <ConnectionStatus
              status={connectionStatus}
              socketConnected={socketConnected}
            />
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-white transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Room Info */}
        <div className="mb-4">
          <RoomInfo roomId={roomId} participantCount={remotePeers.length + 1} />
        </div>

        {/* Video Grid */}
        <div className="mb-4">
          <div
            className={`grid gap-4 ${
              remotePeers.length === 0
                ? 'grid-cols-1'
                : remotePeers.length === 1
                ? 'grid-cols-2'
                : 'grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {/* Local Video */}
            <div>
              <VideoPlayer
                stream={localStream}
                muted={true}
                mirror={true}
                label="あなた"
              />
            </div>

            {/* Remote Videos */}
            {remotePeers.map((peer) => (
              <div key={peer.peerId}>
                <VideoPlayer
                  stream={peer.remoteStream}
                  label={`ユーザー ${peer.peerId.substring(0, 4)}`}
                />
              </div>
            ))}

            {/* Placeholder for empty room */}
            {remotePeers.length === 0 && (
              <div className="video-container flex items-center justify-center bg-gray-800 border-2 border-dashed border-gray-600">
                <div className="text-center px-4">
                  <svg
                    className="w-12 h-12 text-gray-600 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <p className="text-gray-400 text-sm">
                    他のユーザーが参加するのを待っています...
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    ルームリンクを共有して招待しましょう
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center">
          <Controls
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onLeaveRoom={handleLeaveRoom}
            audioEnabled={mediaState.audio}
            videoEnabled={mediaState.video}
          />
        </div>
      </div>
    </div>
  );
}
