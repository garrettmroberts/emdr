"use client";

import { usePeer } from "./context/PeerContext";
import VisualElement from "./components/VisualElement";
import { useAuth } from "./context/AuthContext";
import { useEffect, useState } from "react";
import { FaCopy, FaPlay, FaStop, FaVideoSlash, FaPhone, FaTimes, FaPhoneSlash, FaCamera } from 'react-icons/fa';
import Loader from "./components/Loader";
import Header from "./components/Header";
import MediaControlBar from "./components/MediaControlBar";
import Toast from './components/Toast';
import Hero from './components/Hero';
import CTA from './components/CTA';
import Features from './components/Features';

export default function Home() {
  const { 
    user, 
    userRole, 
    isLoading, 
    justSignedUp, 
    setJustSignedUp 
  } = useAuth();
  const {
    peerId,
    connectionStatus,
    remotePeerId,
    setRemotePeerId,
    copyPeerId,
    connectToPeer,
    disconnectCall,
    localVideoRef,
    remoteVideoRef,
    localStream,
    remoteStream,
    sendMessageToPeer,
    remoteVideoEnabled,
    isCallRinging,
    acceptCall,
    rejectCall,
    updateLocalStream,
    isConnected
  } = usePeer();
  
  const [copySuccess, setCopySuccess] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [visualActive, setVisualActive] = useState(false);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [isCameraMenuOpen, setIsCameraMenuOpen] = useState(false);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  
  // Reset copy success message after 2 seconds
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => setCopySuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);
  
  // Handle copy with feedback
  const handleCopy = () => {
    copyPeerId();
    setCopySuccess(true);
  };

  // Toggle video stream - modified to notify remote peer
  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      
      if (videoEnabled) {
        // When disabling video, stop the tracks completely
        videoTracks.forEach(track => {
          track.stop();
        });
        
        // Create a new stream with only audio
        const audioTracks = localStream.getAudioTracks();
        const newStream = new MediaStream();
        audioTracks.forEach(track => newStream.addTrack(track));
        
        // Update the stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = newStream;
        }
        
        // Update the stream in the peer context
        updateLocalStream(newStream);
      } else {
        // When enabling video, get a new stream with video
        navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: activeCameraId ? { exact: activeCameraId } : undefined,
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
            frameRate: { ideal: 30, min: 15 },
            aspectRatio: { ideal: 1.7778 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 2,
            sampleRate: 48000,
            sampleSize: 16
          }
        }).then(newStream => {
          // Update the stream
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = newStream;
          }
          
          // Update the stream in the peer context
          updateLocalStream(newStream);
        }).catch(err => {
          console.error('Error re-enabling video:', err);
        });
      }
      
      // Only send message if we have an active connection
      if (remoteStream) {
        sendMessageToPeer(videoEnabled ? 'video-disabled' : 'video-enabled');
      }
      
      setVideoEnabled(!videoEnabled);
    }
  };

  // Toggle audio stream
  const toggleAudio = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      
      audioTracks.forEach(track => {
        track.enabled = !audioEnabled;
      });
      
      setAudioEnabled(!audioEnabled);
    }
  };

  // Function to toggle visual element with auto turn-off after 20 seconds
  const toggleVisual = () => {
    // Only proceed if turning animation ON
    if (!visualActive) {
      setVisualActive(true);
      sendMessageToPeer('start-visual');
      
      // Auto turn off after 20 seconds
      setTimeout(() => {
        setVisualActive(false);
        sendMessageToPeer('stop-visual');
      }, 20000);
    } else {
      // Manual turn off
      setVisualActive(false);
      sendMessageToPeer('stop-visual');
    }
  };

  const openControlPanel = () => {
    setIsControlPanelOpen(true);
  };
  
  const closeControlPanel = () => {
    setIsControlPanelOpen(false);
  };

  // Update activeCameraId when localStream changes
  useEffect(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        if (settings.deviceId) {
          setActiveCameraId(settings.deviceId);
        }
      }
      // Ensure video is enabled when stream is available
      setVideoEnabled(true);
    }
  }, [localStream]);

  // Get available cameras when component mounts
  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setAvailableCameras(videoDevices);
        
        // If we have cameras and no active camera ID, set the first one as active
        if (videoDevices.length > 0 && !activeCameraId) {
          setActiveCameraId(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error('Error getting cameras:', err);
      }
    };
    
    getCameras();
  }, [activeCameraId]);

  // Toggle between available cameras
  const toggleCamera = async (deviceId: string) => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: deviceId },
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 15 },
          aspectRatio: { ideal: 1.7778 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 2,
          sampleRate: 48000,
          sampleSize: 16
        }
      });
      
      // Stop old tracks
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      // Update the stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = newStream;
      }
      
      // Update the stream in the peer context
      updateLocalStream(newStream);
      
      // Update active camera
      setActiveCameraId(deviceId);
      
      // Close the menu after selection
      setIsCameraMenuOpen(false);
    } catch (err) {
      console.error('Error switching camera:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="loadingScreen">
       <Loader />
      </div>
    );
  }

  // Landing page for unauthenticated users
  if (!user) {
    return (
      <>
        <div className={isAuthModalOpen ? 'blur-background' : ''}>
          <Header setAuthModalOpen={setIsAuthModalOpen} />
          <main className="main">
            <Toast 
              message="Please check your email for a verification link to complete your registration."
              visible={justSignedUp}
              onClose={() => setJustSignedUp(false)}
            />
            
            <Hero setAuthModalOpen={setIsAuthModalOpen} />
            <Features />
            <CTA setAuthModalOpen={setIsAuthModalOpen} />
            
            <footer className="footer">
              <p>TapiocaEMDR • Secure and confidential • {new Date().getFullYear()} • Made with ❤ in Boulder, CO</p>
            </footer>
          </main>
        </div>
      </>
    );
  }

  // App for authenticated users
  return (
    <>
      <div className={isAuthModalOpen ? 'blur-background' : ''}>
        <Header setAuthModalOpen={setIsAuthModalOpen} />
        <div className="main">
          <div className="sessionContainer">
            <div className="videoBackground">
              {/* Remote video stream as full background */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="remoteStream"
              />
              {!remoteStream && (
                <div className="noStreamOverlay">
                  <p>Waiting for connection...</p>
                </div>
              )}
              
              {remoteStream && !remoteVideoEnabled && (
                <div className="remoteVideoDisabledOverlay">
                  <FaVideoSlash size={50} />
                  <p>Video Paused</p>
                </div>
              )}

              {!isConnected && remoteVideoRef.current?.srcObject && (
                <div className="callEndedOverlay">
                  <FaPhoneSlash size={50} />
                  <p>Call Ended</p>
                </div>
              )}
              
              {/* Local video as picture-in-picture */}
              <div className="localStreamWrapper">
                <video
                  ref={localVideoRef}
                  muted
                  autoPlay
                  playsInline
                  className="localStream"
                />
                {!videoEnabled && (
                  <div className="videoDisabledOverlay">
                    <FaVideoSlash />
                  </div>
                )}
                {availableCameras.length > 1 && (
                  <div className="cameraToggleContainer">
                    <button 
                      onClick={() => setIsCameraMenuOpen(!isCameraMenuOpen)}
                      className="cameraToggleButton"
                      title="Switch Camera"
                    >
                      <FaCamera />
                    </button>
                    {isCameraMenuOpen && (
                      <div className="cameraMenu">
                        {availableCameras.map((camera, index) => (
                          <button
                            key={camera.deviceId}
                            onClick={() => toggleCamera(camera.deviceId)}
                            className={`cameraMenuItem ${camera.deviceId === activeCameraId ? 'active' : ''}`}
                          >
                            {camera.label || `Camera ${index + 1}`}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* EMDR Visual overlay */}
              <div className="visualOverlay">
                <VisualElement 
                  isActive={visualActive}
                  peerControlled={userRole !== 'therapist'} 
                />
              </div>
            </div>
            
            {/* Call button (only visible for therapists) */}
            {userRole === 'therapist' && (
              <button 
                onClick={remoteStream ? disconnectCall : openControlPanel}
                className={`callButton ${remoteStream ? 'active' : ''}`}
              >
                {remoteStream ? <FaStop /> : <FaPhone />}
              </button>
            )}

            {/* Control Panel Modal */}
            {isControlPanelOpen && (
              <div className="modalOverlay">
                <div className="controlPanelModal">
                  <div className="modalHeader">
                    <h3>Start a Session</h3>
                    <button onClick={closeControlPanel} className="closeButton">
                      <FaTimes />
                    </button>
                  </div>
                  
                  <div className="controlsPanel">
                    <div className="statusBar">
                      <div className="connectionStatus">
                        <span className={`statusDot ${connectionStatus.includes('Connected') ? 'connected' : ''}`}></span>
                        <p>{connectionStatus}</p>
                      </div>
                      
                      <div className="peerIdContainer">
                        <div className="peerIdDisplay">
                          <span>Your ID:</span>
                          <code>{peerId}</code>
                        </div>
                        <button 
                          onClick={handleCopy} 
                          className="copyButton"
                          disabled={copySuccess}
                        >
                          {copySuccess ? 'Copied!' : <FaCopy />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="connectionControls">
                      <div className="inputWrapper">
                        <input
                          type="text"
                          placeholder={userRole === 'therapist' ? "Enter client's ID" : "Enter therapist's ID"}
                          value={remotePeerId}
                          onChange={(e) => setRemotePeerId(e.target.value)}
                          className="peerIdInput"
                        />
                      </div>
                      
                      <div className="buttonGroup">
                        <button
                          onClick={() => {
                            connectToPeer(remotePeerId);
                            closeControlPanel();
                          }}
                          disabled={!localStream || !remotePeerId || remoteStream !== null}
                          className="connectButton"
                        >
                          <FaPlay /> Connect
                        </button>
                        
                        <button
                          onClick={disconnectCall}
                          disabled={!remoteStream}
                          className="disconnectButton"
                        >
                          <FaStop /> End Session
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Media Control Bar */}
            <MediaControlBar
              toggleVideo={toggleVideo}
              toggleAudio={toggleAudio}
              toggleVisual={toggleVisual}
              videoEnabled={videoEnabled}
              audioEnabled={audioEnabled}
              visualActive={visualActive}
              localStream={localStream}
              userRole={userRole || 'client'}
            />

            {/* Incoming Call Overlay */}
            {isCallRinging && (
              <div className="incomingCallOverlay">
                <div className="incomingCallModal">
                  <h3>Incoming Call</h3>
                  <p>Someone wants to start a session with you</p>
                  
                  <div className="callActions">
                    <button 
                      onClick={acceptCall}
                      className="acceptCallButton"
                    >
                      <FaPhone /> Accept
                    </button>
                    
                    <button 
                      onClick={rejectCall}
                      className="rejectCallButton"
                    >
                      <FaPhoneSlash /> Decline
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <footer className="footer">
          <p>TapiocaEMDR • Secure and confidential • {new Date().getFullYear()} • Made with ❤ in Boulder, CO</p>
        </footer>
      </div>
    </>
  );
}