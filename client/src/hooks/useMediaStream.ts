import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseMediaStreamReturn {
  localStream: MediaStream | null;
  cameraOn: boolean;
  micOn: boolean;
  facingMode: 'user' | 'environment';
  mediaError: string | null;
  isLoadingMedia: boolean;
  requestMediaPermissions: () => Promise<MediaStream | null>;
  toggleCamera: () => void;
  toggleMicrophone: () => void;
  flipCamera: () => Promise<void>;
  stopMediaStream: () => void;
}

export function useMediaStream(): UseMediaStreamReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState<boolean>(true);
  const [micOn, setMicOn] = useState<boolean>(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [isLoadingMedia, setIsLoadingMedia] = useState<boolean>(false);

  const streamRef = useRef<MediaStream | null>(null);
  const cameraOnRef = useRef(cameraOn);
  const micOnRef = useRef(micOn);
  cameraOnRef.current = cameraOn;
  micOnRef.current = micOn;

  const requestMediaPermissions = useCallback(async (): Promise<MediaStream | null> => {
    setIsLoadingMedia(true);
    setMediaError(null);

    // If stream already exists and active, return it
    if (streamRef.current && streamRef.current.active) {
      setIsLoadingMedia(false);
      return streamRef.current;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support WebRTC camera access.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: facingMode
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setLocalStream(stream);

      // Apply initial track states using refs to avoid stale closure values
      stream.getVideoTracks().forEach(track => (track.enabled = cameraOnRef.current));
      stream.getAudioTracks().forEach(track => (track.enabled = micOnRef.current));

      setIsLoadingMedia(false);
      return stream;
    } catch (err: any) {
      setIsLoadingMedia(false);
      let friendlyMessage = 'Could not access your camera or microphone.';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        friendlyMessage = 'Camera and microphone permissions were denied. Please grant permission in browser settings to start.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        friendlyMessage = 'No camera or microphone device was detected on your device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        friendlyMessage = 'Your camera or microphone is currently being used by another application.';
      }

      setMediaError(friendlyMessage);
      return null;
    }
  }, [facingMode]);

  const toggleCamera = useCallback(() => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        const nextState = !cameraOn;
        videoTracks.forEach(track => {
          track.enabled = nextState;
        });
        setCameraOn(nextState);
      }
    }
  }, [cameraOn]);

  const toggleMicrophone = useCallback(() => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextState = !micOn;
        audioTracks.forEach(track => {
          track.enabled = nextState;
        });
        setMicOn(nextState);
      }
    }
  }, [micOn]);

  const flipCamera = useCallback(async () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacing);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setLocalStream(null);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: nextFacing },
        audio: micOn
      });
      streamRef.current = stream;
      setLocalStream(stream);
      stream.getVideoTracks().forEach(t => (t.enabled = cameraOn));
    } catch (err) {
      setMediaError('Could not switch camera.');
    }
  }, [facingMode, cameraOn, micOn]);

  const stopMediaStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setLocalStream(null);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopMediaStream();
    };
  }, [stopMediaStream]);

  return {
    localStream,
    cameraOn,
    micOn,
    facingMode,
    mediaError,
    isLoadingMedia,
    requestMediaPermissions,
    toggleCamera,
    toggleMicrophone,
    flipCamera,
    stopMediaStream
  };
}
