# WebRTC Video Chat Application

Next.js + TypeScript + WebRTC を使用したリアルタイムビデオ通話アプリケーション

## 技術スタック

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Socket.io** (シグナリングサーバー)
- **WebRTC** (P2P通信)

## 機能

- ✅ リアルタイムビデオ通話（1対1およびマルチユーザー）
- ✅ ルームベースのアーキテクチャ
- ✅ 音声/ビデオのオン・オフ切り替え
- ✅ 接続状態の表示
- ✅ ルームリンクの共有機能
- ✅ レスポンシブデザイン

## セットアップ

### 依存関係のインストール

```bash
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは http://localhost:3000 で起動します。

## デプロイ

本番環境へのデプロイ方法については、[DEPLOYMENT.md](./DEPLOYMENT.md) を参照してください。

### 推奨構成（クレジットカード不要）
- Socket.IOサーバー: **Koyeb** (無料プラン、クレジットカード不要)
- Next.jsフロントエンド: **Vercel** (無料プラン)

### 代替構成
- Socket.IOサーバー: Render (クレジットカード必要)
- Next.jsフロントエンド: Vercel

## 使い方

### 1. ルームを作成

1. ホームページで「ルームを作成」ボタンをクリック
2. 自動的に新しいルームが作成され、ビデオチャット画面に遷移します
3. 「リンクをコピー」ボタンで招待リンクをコピーし、他のユーザーに共有

### 2. ルームに参加

1. ホームページで「ルームIDを入力」欄に共有されたルームIDを入力
2. 「参加」ボタンをクリック
3. カメラとマイクの許可を求められたら、許可してください

### 3. ビデオ通話

- **マイクボタン**: 音声のミュート/アンミュート
- **カメラボタン**: ビデオのオン/オフ
- **電話ボタン**: 通話を終了してホームに戻る

## ローカルでのテスト方法

### 同じデバイスで複数のブラウザを使用

1. 開発サーバーを起動: `npm run dev`
2. Chrome で http://localhost:3000 を開いてルームを作成
3. Firefox や Safari など別のブラウザで同じルームに参加

### 異なるデバイスで接続

1. 開発サーバーを起動: `npm run dev`
2. ローカルIPアドレスを確認:
   ```bash
   # macOS/Linux
   ipconfig getifaddr en0

   # Windows
   ipconfig
   ```
3. 同じネットワーク上の他のデバイスから `http://[あなたのIP]:3000` にアクセス

## プロジェクト構造

```
web-rtc/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx             # ホームページ
│   │   ├── room/[roomId]/       # 動的ルーム画面
│   │   ├── layout.tsx           # ルートレイアウト
│   │   └── globals.css          # グローバルスタイル
│   │
│   ├── components/              # Reactコンポーネント
│   │   └── VideoChat/
│   │       ├── VideoPlayer.tsx  # ビデオ表示
│   │       ├── Controls.tsx     # コントロールボタン
│   │       ├── ConnectionStatus.tsx  # 接続状態
│   │       └── RoomInfo.tsx     # ルーム情報
│   │
│   ├── hooks/                   # カスタムReact Hooks
│   │   ├── useSocket.ts         # Socket.io接続
│   │   ├── useMediaStream.ts    # メディアストリーム管理
│   │   └── useWebRTC.ts         # WebRTC接続管理
│   │
│   ├── lib/                     # ユーティリティ
│   │   └── webrtc/
│   │       └── config.ts        # WebRTC設定
│   │
│   └── types/                   # TypeScript型定義
│       ├── webrtc.ts
│       └── socket.ts
│
├── server/                      # カスタムサーバー
│   ├── index.ts                # Next.js + Socket.io統合（開発用）
│   ├── standalone.ts           # Socket.ioサーバー（本番用）
│   └── socketHandler.ts        # Socket.ioイベントハンドラ
│
├── DEPLOYMENT.md               # デプロイガイド
├── render.yaml                 # Render設定ファイル
├── tsconfig.server.json        # サーバー用TypeScript設定
└── package.json
```

## アーキテクチャ

### シグナリングフロー

```
ユーザーA          サーバー          ユーザーB
   |                 |                  |
   |-- join-room --->|                  |
   |                 |<-- join-room ----|
   |                 |                  |
   |                 |-- user-joined -->|
   |<-- user-joined -|                  |
   |                 |                  |
   |-- offer ------->|                  |
   |                 |-- offer -------->|
   |                 |                  |
   |                 |<-- answer -------|
   |<-- answer ------|                  |
   |                 |                  |
   |<===== ICE候補の交換 ============>|
   |                 |                  |
   |<======== P2P接続確立 ===========>|
```

### WebRTC設定

- **STUNサーバー**: Google の公開STUNサーバーを使用
  - `stun:stun.l.google.com:19302`
  - `stun:stun1.l.google.com:19302`
- **接続方式**: メッシュトポロジー（各ユーザーが他の全ユーザーと直接接続）

## トラブルシューティング

### カメラ/マイクにアクセスできない

- ブラウザの設定でカメラとマイクの許可を確認してください
- HTTPSまたはlocalhostでのみメディアデバイスにアクセスできます

### 接続が確立されない

- ファイアウォールの設定を確認してください
- 同じネットワーク上にいることを確認してください
- ブラウザのコンソールでエラーログを確認してください

### ビデオが表示されない

- WebRTC対応ブラウザ（Chrome, Firefox, Safari, Edge）を使用してください
- カメラが他のアプリケーションで使用されていないか確認してください

## ライセンス

MIT
