import { useState, useEffect, useRef } from 'react';
import { FaVideo, FaMicrophone, FaCaretDown, FaCamera } from 'react-icons/fa';
import Toast from './Toast';

interface DeviceSelectorProps {
  onVideoDeviceChange: (deviceId: string) => void;
  onAudioDeviceChange: (deviceId: string) => void;
  hasMediaAccess: boolean;
}

export default function DeviceSelector({ 
  onVideoDeviceChange, 
  onAudioDeviceChange, 
  hasMediaAccess 
}: DeviceSelectorProps) {
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isAudioOpen, setIsAudioOpen] = useState(false);
  const [showAccessToast, setShowAccessToast] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasMediaAccess) {
      // Get initial devices
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          setVideoDevices(devices.filter(device => device.kind === 'videoinput'));
          setAudioDevices(devices.filter(device => device.kind === 'audioinput'));
        });

      // Listen for device changes
      navigator.mediaDevices.addEventListener('devicechange', () => {
        navigator.mediaDevices.enumerateDevices()
          .then(devices => {
            setVideoDevices(devices.filter(device => device.kind === 'videoinput'));
            setAudioDevices(devices.filter(device => device.kind === 'audioinput'));
          });
      });
    }

    // Close dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (videoRef.current && !videoRef.current.contains(event.target as Node)) {
        setIsVideoOpen(false);
      }
      if (audioRef.current && !audioRef.current.contains(event.target as Node)) {
        setIsAudioOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [hasMediaAccess]);

  const handleDeviceClick = () => {
    if (!hasMediaAccess) {
      setShowAccessToast(true);
      setTimeout(() => setShowAccessToast(false), 5000);
    }
  };

  return (
    <>
      <Toast
        message="Please enable camera and microphone access in your browser settings to use these features."
        visible={showAccessToast}
        onClose={() => setShowAccessToast(false)}
      />
      <div className="deviceSelector">
        <div className="deviceSelector__button" ref={videoRef}>
          <button 
            onClick={() => hasMediaAccess ? setIsVideoOpen(!isVideoOpen) : handleDeviceClick()}
            className={`deviceButton ${isVideoOpen ? 'active' : ''}`}
          >
            <FaVideo />
            <FaCaretDown />
          </button>
          {isVideoOpen && (
            <div className="deviceDropdown">
              {videoDevices.map(device => (
                <button
                  key={device.deviceId}
                  onClick={() => {
                    onVideoDeviceChange(device.deviceId);
                    setIsVideoOpen(false);
                  }}
                  className="deviceOption"
                >
                  {device.label || `Camera ${videoDevices.indexOf(device) + 1}`}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="deviceSelector__button" ref={audioRef}>
          <button 
            onClick={() => hasMediaAccess ? setIsAudioOpen(!isAudioOpen) : handleDeviceClick()}
            className={`deviceButton ${isAudioOpen ? 'active' : ''}`}
          >
            <FaMicrophone />
            <FaCaretDown />
          </button>
          {isAudioOpen && (
            <div className="deviceDropdown">
              {audioDevices.map(device => (
                <button
                  key={device.deviceId}
                  onClick={() => {
                    onAudioDeviceChange(device.deviceId);
                    setIsAudioOpen(false);
                  }}
                  className="deviceOption"
                >
                  {device.label || `Microphone ${audioDevices.indexOf(device) + 1}`}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 