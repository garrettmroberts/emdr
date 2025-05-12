"use client";

import styles from "./page.module.css";
import Peer from "peerjs";
import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [peerId, setPeerId] = useState<string | null>(null);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remotePeerId, setRemotePeerId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const activeCalls = useRef<Map<string, any>>(new Map());
  const pendingCalls = useRef<Array<any>>([]);

  // Initialize peer ID
  useEffect(() => {
    const peerId = Math.random().toString(36).substring(2, 10);
    setPeerId(peerId);
  }, []);

  // Setup peer when peer ID is available
  useEffect(() => {
    if (peerId) {
      // First get media, then create peer
      getUserMedia().then(() => {
        createPeer(peerId);
      }).catch(err => {
        console.error('Failed to get user media:', err);
        // Still create peer even if media fails
        createPeer(peerId);
      });
    }
    
    return () => {
      if (peer) {
        peer.destroy();
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [peerId]);

  // Handle local video
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Handle remote video
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      console.log('Setting remote stream to video element');
      remoteVideoRef.current.srcObject = remoteStream;
      
      remoteVideoRef.current.play().catch(err => {
        console.error('Error playing remote video:', err);
      });
    }
  }, [remoteStream]);

  // Handle pending calls if local stream becomes available
  useEffect(() => {
    if (localStream && pendingCalls.current.length > 0) {
      console.log('Handling pending calls now that stream is available');
      pendingCalls.current.forEach(call => {
        answerCall(call);
      });
      pendingCalls.current = [];
    }
  }, [localStream]);

  const getUserMedia = async () => {
    console.log('Requesting user media...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      console.log('Got local stream:', stream.id);
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('Failed to get local stream', err);
      setConnectionStatus('Camera/mic access failed');
      throw err;
    }
  }

  const copyPeerId = () => {
    if (peerId) {
      navigator.clipboard.writeText(peerId)
        .then(() => {
          setConnectionStatus('Peer ID copied to clipboard!');
          setTimeout(() => {
            if (connectionStatus === 'Peer ID copied to clipboard!') {
              setConnectionStatus(isConnected ? 'Connected' : 'Disconnected');
            }
          }, 2000);
        })
        .catch(err => {
          console.error('Failed to copy peer ID:', err);
        });
    }
  };

  const createPeer = (peerId: string) => {
    console.log('Creating peer with ID:', peerId);
    
    const newPeer = new Peer(peerId, {
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ]
      },
      debug: 3
    });
    
    newPeer.on('open', (id) => {
      console.log('Peer connection opened with ID:', id);
      setPeer(newPeer);
      
      // Only now add the call handler when we know the peer is ready
      newPeer.on('call', (call) => {
        console.log('Incoming call from:', call.peer);
        
        // If we have a stream already, answer immediately
        if (localStream) {
          answerCall(call);
        } else {
          // Otherwise store the call to answer later
          console.log('No local stream available yet, adding call to pending queue');
          setConnectionStatus('Getting camera access to answer call...');
          pendingCalls.current.push(call);
          
          // Try to get media again
          getUserMedia().then(() => {
            // Media will be handled by the useEffect
          });
        }
      });
    });

    newPeer.on('error', (err) => {
      console.error('Peer error:', err);
      setConnectionStatus(`Error: ${err.type}`);
    });

    newPeer.on('connection', (conn) => {
      console.log('Data connection established:', conn.peer);
    });
    
    setPeer(newPeer);
  }

  const answerCall = (call: any) => {
    if (!localStream) {
      console.error('Cannot answer call without local stream');
      return;
    }

    setConnectionStatus(`Answering call from ${call.peer}...`);
    
    // Store the call for potential future reference
    activeCalls.current.set(call.peer, call);
    
    // Answer the call with our local stream
    console.log('Answering call with stream:', localStream.id);
    call.answer(localStream);
    
    call.on('stream', (incomingStream) => {
      console.log('Received remote stream from incoming call:', incomingStream.id);
      setRemoteStream(incomingStream);
      setIsConnected(true);
      setConnectionStatus(`Connected to ${call.peer}`);
    });
    
    call.on('close', () => {
      console.log('Incoming call closed');
      setIsConnected(false);
      setRemoteStream(null);
      setConnectionStatus('Call ended');
      activeCalls.current.delete(call.peer);
    });
    
    call.on('error', (err) => {
      console.error('Call error:', err);
      setConnectionStatus(`Call error: ${err}`);
    });
  };

  const callPeer = (remotePeerId: string) => {
    if (!peer || !localStream) {
      console.error('Cannot call: Peer not initialized or no local stream');
      return;
    }
    
    console.log('Attempting to call peer:', remotePeerId);
    setConnectionStatus(`Calling ${remotePeerId}...`);
    
    // Create a data connection first
    const dataConn = peer.connect(remotePeerId);
    dataConn.on('open', () => {
      console.log('Data connection established before call');
      dataConn.send('Hi from caller');
    });
    
    // Make the call with our local stream
    console.log('Calling with stream:', localStream.id);
    const call = peer.call(remotePeerId, localStream);
    activeCalls.current.set(remotePeerId, call);
    
    call.on('stream', (incomingStream) => {
      console.log('Got remote stream from outgoing call:', incomingStream.id);
      setRemoteStream(incomingStream);
      setIsConnected(true);
      setConnectionStatus(`Connected to ${remotePeerId}`);
    });

    call.on('error', (err) => {
      console.error('Call error:', err);
      setConnectionStatus(`Call error: ${err}`);
    });

    call.on('close', () => {
      console.log('Call closed');
      setIsConnected(false);
      setRemoteStream(null);
      setConnectionStatus('Call ended');
      activeCalls.current.delete(remotePeerId);
    });
  }

  const disconnectCall = () => {
    activeCalls.current.forEach((call) => {
      call.close();
    });
    activeCalls.current.clear();
    
    setIsConnected(false);
    setRemoteStream(null);
    setConnectionStatus('Disconnected');
  };

  const connectToPeer = () => {
    if (remotePeerId) {
      callPeer(remotePeerId);
    }
  };

  return (
    <div className={styles.container}>
      <h1>EMDR Video Chat</h1>
      
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
            onClick={connectToPeer}
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
    </div>
  );
}