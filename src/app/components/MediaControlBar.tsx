"use client";

import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaPlay, FaPause } from 'react-icons/fa';

interface MediaControlBarProps {
  toggleVideo: () => void;
  toggleAudio: () => void;
  toggleVisual: () => void;
  videoEnabled: boolean;
  audioEnabled: boolean;
  visualActive: boolean;
  localStream: MediaStream | null;
  userRole: string;
}

export default function MediaControlBar({
  toggleVideo,
  toggleAudio,
  toggleVisual,
  videoEnabled,
  audioEnabled,
  visualActive,
  localStream,
  userRole
}: MediaControlBarProps) {
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
          <button 
            onClick={toggleVisual}
            className={`mediaButton ${visualActive ? 'active' : ''}`}
            disabled={!localStream}
          >
            {visualActive ? <FaPause /> : <FaPlay />}
            <span>{visualActive ? 'Stop Visual' : 'Start Visual'}</span>
          </button>
        )}
      </div>
    </div>
  );
}