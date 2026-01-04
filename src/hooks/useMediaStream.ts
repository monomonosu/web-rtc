'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { mediaConstraints } from '../lib/webrtc/config';
import type { MediaState } from '../types/webrtc';

export const useMediaStream = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [mediaState, setMediaState] = useState<MediaState>({
    audio: true,
    video: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const initializeMedia = useCallback(async () => {
    setIsInitializing(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        mediaConstraints
      );
      localStreamRef.current = stream;
      setLocalStream(stream);
      console.log('Local media stream initialized:', stream.id);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to access media devices';
      console.error('Error accessing media devices:', err);
      setError(errorMessage);

      // Provide more specific error messages
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setError(
            'Camera/microphone access denied. Please allow permissions and try again.'
          );
        } else if (err.name === 'NotFoundError') {
          setError('No camera or microphone found on this device.');
        }
      }
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setMediaState((prev) => ({ ...prev, audio: audioTracks[0]?.enabled }));
      console.log('Audio toggled:', audioTracks[0]?.enabled);
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setMediaState((prev) => ({ ...prev, video: videoTracks[0]?.enabled }));
      console.log('Video toggled:', videoTracks[0]?.enabled);
    }
  }, [localStream]);

  const cleanup = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
      setLocalStream(null);
    }
  }, [localStream]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          track.stop();
          console.log('Stopped track on unmount:', track.kind);
        });
        localStreamRef.current = null;
      }
    };
  }, []);

  return {
    localStream,
    mediaState,
    error,
    isInitializing,
    initializeMedia,
    toggleAudio,
    toggleVideo,
    cleanup,
  };
};
