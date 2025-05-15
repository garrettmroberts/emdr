"use client";

import { usePeer } from "./context/PeerContext";
import VisualElement from "./components/VisualElement";
import { useAuth } from "./context/AuthContext";
import { useEffect, useState } from "react";
import { FaCopy, FaPlay, FaStop, FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import Loader from "./components/Loader";
import Image from 'next/image';
import Header from "./components/Header";

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
  } = usePeer();
  
  const [copySuccess, setCopySuccess] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoTrackBackup, setVideoTrackBackup] = useState<MediaStreamTrack | null>(null);
  
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

  // Toggle video stream - modified to properly stop camera
  const toggleVideo = async () => {
    if (localStream) {
      if (videoEnabled) {
        // Turn off video: Stop all video tracks to turn off camera light
        const videoTracks = localStream.getVideoTracks();
        if (videoTracks.length > 0) {
          // Store a reference to the first track before stopping it
          setVideoTrackBackup(videoTracks[0]);
          
          // Stop all video tracks (this will turn off the camera light)
          videoTracks.forEach(track => track.stop());
          
          // Remove tracks from the stream
          videoTracks.forEach(track => localStream.removeTrack(track));
        }
      } else {
        // Turn on video: Recreate video track
        try {
          const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
          const newVideoTrack = newStream.getVideoTracks()[0];
          
          // Add the new track to the existing stream
          localStream.addTrack(newVideoTrack);
        } catch (err) {
          console.error("Failed to restart camera:", err);
        }
      }
      setVideoEnabled(!videoEnabled);
    }
  };

  // Toggle audio stream - modified to properly stop microphone hardware
  const toggleAudio = async () => {
    if (localStream) {
      if (audioEnabled) {
        // Turn off audio: Stop all audio tracks to release microphone hardware
        const audioTracks = localStream.getAudioTracks();
        if (audioTracks.length > 0) {
          // Stop all audio tracks (this will release the microphone hardware)
          audioTracks.forEach(track => track.stop());
          
          // Remove tracks from the stream
          audioTracks.forEach(track => localStream.removeTrack(track));
        }
      } else {
        // Turn on audio: Recreate audio track
        try {
          const newStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const newAudioTrack = newStream.getAudioTracks()[0];
          
          // Add the new track to the existing stream
          localStream.addTrack(newAudioTrack);
        } catch (err) {
          console.error("Failed to restart microphone:", err);
        }
      }
      setAudioEnabled(!audioEnabled);
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
                    // Fallback if image doesn't exist
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
                size={60}
                speed={1.5}
                distance={400}
                color="#1DCD9F"
                peerControlled={true}
              />
            </div>
          </div>
          
          {/* Controls panel */}
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
                  onClick={() => connectToPeer(remotePeerId)}
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

          {/* Media Control Bar */}
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
            </div>
          </div>
        </div>
      </div>
      <footer className="footer">
        <p>TapiocaEMDR • Secure and confidential • {new Date().getFullYear()} • Made with ❤ in Boulder, CO</p>
      </footer>
    </div>
  );
}