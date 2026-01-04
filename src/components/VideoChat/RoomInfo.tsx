'use client';

import { useState } from 'react';

interface RoomInfoProps {
  roomId: string;
  participantCount?: number;
}

export const RoomInfo: React.FC<RoomInfoProps> = ({
  roomId,
  participantCount,
}) => {
  const [copied, setCopied] = useState(false);

  const copyRoomLink = async () => {
    const roomUrl = `${window.location.origin}/room/${roomId}`;

    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-400 mb-1">ルームID</div>
          <div className="font-mono text-sm text-white truncate">{roomId}</div>
          {participantCount !== undefined && (
            <div className="text-xs text-gray-400 mt-1">
              参加者: {participantCount}人
            </div>
          )}
        </div>
        <button
          onClick={copyRoomLink}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {copied ? (
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              コピー済み
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              リンクをコピー
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
