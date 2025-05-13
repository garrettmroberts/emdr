"use client";

import styles from "./page.module.css";
import { usePeer } from "./context/PeerContext";
import VisualElement from "./components/VisualElement";
import AuthNav from "./components/AuthNav";
import { useAuth } from "./context/AuthContext";

export default function Home() {
  const { user, isLoading } = useAuth();
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
    startAnimation,
    stopAnimation
  } = usePeer();

  if (isLoading) {
    return <div>Loading authentication...</div>;
  }

  return (
    <div className={styles.container}>
      <AuthNav />
      <h1>EMDR Video Chat</h1>
      
      {!user ? (
        <div className={styles.authPrompt}>
          <h2>Welcome to EMDR Video Chat</h2>
          <p>Please log in to access the video chat features.</p>
          <a href="/auth" className={styles.loginButton}>
            Login or Sign Up
          </a>
        </div>
      ) : (
        <>
          <div className={styles.statusBar}>
            <p>
              <strong>Status:</strong> {connectionStatus}
            </p>
            <div>
              <span><strong>Your ID:</strong> {peerId}</span>
              <button onClick={copyPeerId} className={styles.copyButton}>
                Copy ID
              </button>
            </div>
          </div>
          
          <div className={styles.videoGrid}>
            <div className={styles.videoContainer}>
              <h3>Your Video</h3>
              <video 
                ref={localVideoRef}
                muted
                autoPlay
                playsInline
                className={styles.video}
              />
            </div>
            
            <div className={styles.videoContainer}>
              <h3>Remote Video</h3>
              <video 
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={styles.video}
              />
              {!remoteStream && <div className={styles.placeholder}>No remote stream</div>}
            </div>
          </div>
          
          <div className={styles.controls}>
            <input
              type="text"
              placeholder="Enter remote peer ID"
              value={remotePeerId}
              onChange={(e) => setRemotePeerId(e.target.value)}
              className={styles.peerIdInput}
            />
            
            <div className={styles.buttonGroup}>
              <button
                onClick={() => connectToPeer(remotePeerId)}
                disabled={!localStream || !remotePeerId || remoteStream !== null}
                className={styles.connectButton}
              >
                Connect
              </button>
              
              <button
                onClick={disconnectCall}
                disabled={!remoteStream}
                className={styles.disconnectButton}
              >
                Disconnect
              </button>
            </div>
          </div>
          
          <p className={styles.instructions}>
            <strong>Instructions:</strong> Share your ID with someone else. Enter their ID and press Connect.
          </p>
          
          <VisualElement 
            size={60}
            speed={1.5}
            distance={400}
            color="#FF5733"
            peerControlled={true}
          />
        </>
      )}
    </div>
  );
}