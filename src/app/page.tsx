"use client";

import { usePeer } from "./context/PeerContext";
import VisualElement from "./components/VisualElement";
import { useAuth } from "./context/AuthContext";
import { useEffect, useState } from "react";
import { FaCopy, FaPlay, FaStop, FaVideoSlash, FaShieldAlt, FaLaptopMedical, FaBrain, FaRegCommentDots, FaPhone, FaTimes, FaPhoneSlash } from 'react-icons/fa';
import Loader from "./components/Loader";
import Image from 'next/image';
import Header from "./components/Header";
import MediaControlBar from "./components/MediaControlBar";

export default function Home() {
  const { user, userRole, isLoading } = useAuth();
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
    rejectCall
  } = usePeer();
  
  const [copySuccess, setCopySuccess] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [visualActive, setVisualActive] = useState(false);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  
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
      
      videoTracks.forEach(track => {
        track.enabled = !videoEnabled;
      });
      
      sendMessageToPeer(videoEnabled ? 'video-disabled' : 'video-enabled');
      
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
      <div className="container">
        <Header />
        
        <main className="main">
          {/* Hero Section */}
          <section className="hero">
            <div className="heroContent">
              <div className="heroText">
                <h1>Transform Your Therapy Practice with Online EMDR</h1>
                <p>
                  Provide effective EMDR therapy online through secure video sessions,
                  bilateral stimulation tools, and an intuitive platform designed for therapists and clients.
                </p>
                <a href="/auth" className="loginButton">
                  <span className="highlight">Get Started</span> with Tapioca EMDR
                </a>
              </div>
              <div className="heroVisual">
                <div className="circle circle1"></div>
                <div className="circle circle2"></div>
                <Image 
                  src="/emdr-therapy-illustration.png" 
                  alt="EMDR Therapy Illustration"
                  className="heroImage"
                  width={500} 
                  height={300} 
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      target.parentElement.style.background = 'linear-gradient(135deg, rgba(29,205,159,0.2), rgba(22,153,118,0.2))';
                      target.parentElement.style.borderRadius = '16px';
                    }
                  }}
                />
              </div>
            </div>
          </section>
          
          {/* Features Section */}
          <section className="featuresSection">
            <div className="sectionTitle">
              <h2>Why Choose Tapioca EMDR?</h2>
              <p>Our platform combines security, simplicity, and clinical effectiveness</p>
            </div>
            
            <div className="featuresGrid">
              <div className="featureCard">
                <div className="featureIcon">
                  <FaShieldAlt />
                </div>
                <h3>Secure & Private</h3>
                <p>End-to-end encrypted video sessions ensure your therapy remains confidential and HIPAA-compliant.</p>
              </div>
              
              <div className="featureCard">
                <div className="featureIcon">
                  <FaLaptopMedical />
                </div>
                <h3>Specialized for EMDR</h3>
                <p>Custom-built bilateral stimulation tools designed specifically for online EMDR therapy.</p>
              </div>
              
              <div className="featureCard">
                <div className="featureIcon">
                  <FaBrain />
                </div>
                <h3>Evidence-Based</h3>
                <p>Built on research supporting the effectiveness of online EMDR therapy for trauma processing.</p>
              </div>
              
              <div className="featureCard">
                <div className="featureIcon">
                  <FaRegCommentDots />
                </div>
                <h3>Easy Communication</h3>
                <p>Simple interface for both therapists and clients with no software downloads required.</p>
              </div>
            </div>
          </section>
          
          {/* CTA Section */}
          <section className="ctaSection">
            <h2>Ready to Elevate Your Therapy Practice?</h2>
            <p>Join therapists worldwide who are expanding their reach and improving outcomes with Tapioca EMDR</p>
            <a href="/auth" className="loginButton">
              Start Your Journey Today
            </a>
          </section>
        </main>
        
        <footer className="footer">
          <p>TapiocaEMDR • Secure and confidential • {new Date().getFullYear()} • Made with ❤ in Boulder, CO</p>
        </footer>
      </div>
    );
  }

  // App for authenticated users
  return (
    <div className="container">
      <Header />
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
  );
}