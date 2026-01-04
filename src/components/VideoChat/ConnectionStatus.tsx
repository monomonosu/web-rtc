'use client';

import type { ConnectionStatus as Status } from '../../types/webrtc';

interface ConnectionStatusProps {
  status: Status;
  socketConnected: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  socketConnected,
}) => {
  const getStatusColor = () => {
    if (!socketConnected) return 'bg-red-500';

    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'disconnected':
        return 'bg-orange-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    if (!socketConnected) return 'サーバー未接続';

    switch (status) {
      case 'connected':
        return '接続中';
      case 'connecting':
        return '接続を確立中...';
      case 'disconnected':
        return '切断';
      case 'failed':
        return '接続失敗';
      default:
        return '待機中';
    }
  };

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-full border border-gray-700">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`} />
      <span className="text-sm text-gray-300 font-medium">{getStatusText()}</span>
    </div>
  );
};
