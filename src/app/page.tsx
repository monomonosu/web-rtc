'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');

  const createRoom = () => {
    // Generate a random room ID
    const newRoomId = Math.random().toString(36).substring(2, 10);
    router.push(`/room/${newRoomId}`);
  };

  const joinRoom = () => {
    if (roomId.trim()) {
      router.push(`/room/${roomId.trim()}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      joinRoom();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-md w-full mx-4">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700">
          <h1 className="text-4xl font-bold text-center mb-2 text-white">
            WebRTC Video Chat
          </h1>
          <p className="text-center text-gray-400 mb-8">
            リアルタイムビデオ通話アプリ
          </p>

          <div className="space-y-6">
            {/* Create Room Section */}
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-200">
                新しいルームを作成
              </h2>
              <button
                onClick={createRoom}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
              >
                ルームを作成
              </button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">または</span>
              </div>
            </div>

            {/* Join Room Section */}
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-200">
                ルームに参加
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="ルームIDを入力"
                  className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={joinRoom}
                  disabled={!roomId.trim()}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
                >
                  参加
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-xs text-gray-500 text-center">
              P2P接続によるリアルタイムビデオ通話
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
