"use client";

import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaPlay, FaPause, FaCog } from 'react-icons/fa';
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
  onVisualSettingsChange?: (settings: { color: string; size: number }) => void;
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
  onVisualSettingsChange
}: MediaControlBarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSettingsSave = (settings: { color: string; size: number }) => {
    if (onVisualSettingsChange) {
      onVisualSettingsChange(settings);
    }
  };

  return (
    <div className="mediaControlBar">
      <div className="mediaControlsWrapper">
        <button 
          onClick={toggleVideo}
          className={`mediaButton ${!videoEnabled ? 'disabled' : ''}`}
          disabled={!localStream}
        >
          {videoEnabled ? <FaVideo /> : <FaVideoSlash />}
          <span>{videoEnabled ? 'Disable Video' : 'Enable Video'}</span>
        </button>
        
        <button 
          onClick={toggleAudio}
          className={`mediaButton ${!audioEnabled ? 'disabled' : ''}`}
          disabled={!localStream}
        >
          {audioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
          <span>{audioEnabled ? 'Mute Audio' : 'Unmute Audio'}</span>
        </button>
        
        {/* Only therapists can control the visualization */}
        {userRole === 'therapist' && (
          <>
            <button 
              onClick={toggleVisual}
              className={`mediaButton ${visualActive ? 'active' : ''}`}
              disabled={!localStream}
            >
              {visualActive ? <FaPause /> : <FaPlay />}
              <span>{visualActive ? 'Stop Visual' : 'Start Visual'}</span>
            </button>

            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="mediaButton"
              disabled={!localStream}
            >
              <FaCog />
              <span>Settings</span>
            </button>
          </>
        )}
      </div>

      <VisualSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSettingsSave}
      />
    </div>
  );
}