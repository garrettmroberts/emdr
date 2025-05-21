"use client";

import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaPlay, FaPause, FaCog, FaEye } from 'react-icons/fa';
import { useState } from 'react';
import VisualSettingsModal from './VisualSettingsModal';

interface MediaControlBarProps {
  toggleVideo: () => void;
  toggleAudio: () => void;
  toggleVisual: () => void;
  videoEnabled: boolean;
  audioEnabled: boolean;
  visualActive: boolean;
  localStream: MediaStream | null;
  userRole: string;
  onVisualSettingsChange: (settings: { color: string; size: number; duration: number }) => void;
  visualSettings?: { color: string; size: number; duration: number };
}

export default function MediaControlBar({
  toggleVideo,
  toggleAudio,
  toggleVisual,
  videoEnabled,
  audioEnabled,
  visualActive,
  localStream,
  userRole,
  onVisualSettingsChange,
  visualSettings = { color: '#169976', size: 100, duration: 20 }
}: MediaControlBarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="mediaControlBar">
      <div className="mediaControlsWrapper">
        <button
          onClick={toggleVideo}
          className={`mediaButton ${!videoEnabled ? 'disabled' : ''}`}
          disabled={!localStream}
        >
          {videoEnabled ? <FaVideo /> : <FaVideoSlash />}
          <span>Video</span>
        </button>
        <button
          onClick={toggleAudio}
          className={`mediaButton ${!audioEnabled ? 'disabled' : ''}`}
          disabled={!localStream}
        >
          {audioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
          <span>Audio</span>
        </button>
        <button
          onClick={toggleVisual}
          className={`mediaButton ${visualActive ? 'active' : ''}`}
          disabled={!localStream}
        >
          <FaEye />
          <span>Visual</span>
        </button>
        {userRole === 'therapist' && (
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="mediaButton"
          >
            <FaCog />
            <span>Settings</span>
          </button>
        )}
      </div>

      <VisualSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsChange={onVisualSettingsChange}
        initialSettings={visualSettings}
      />
    </div>
  );
}