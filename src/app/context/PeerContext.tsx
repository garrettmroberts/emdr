"use client";

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import Peer, { MediaConnection } from 'peerjs';

interface PeerContextType {
  peerId: string | null;
  peer: Peer | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnected: boolean;
  connectionStatus: string;
  remotePeerId: string;
  setRemotePeerId: (id: string) => void;
  copyPeerId: () => void;
  connectToPeer: (id: string) => void;
  disconnectCall: () => void;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
}

const PeerContext = createContext<PeerContextType | null>(null);

export const usePeer = () => {
  const context = useContext(PeerContext);
  if (!context) {
    throw new Error('usePeer must be used within a PeerProvider');
  }
  return context;
};

export const PeerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [peerId, setPeerId] = useState<string | null>(null);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remotePeerId, setRemotePeerId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const activeCalls = useRef<Map<string, MediaConnection>>(new Map());
  const pendingCalls = useRef<Array<MediaConnection>>([]);

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

  const answerCall = (call: MediaConnection) => {
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

  const connectToPeer = (id: string = remotePeerId) => {
    if (id) {
      callPeer(id);
    }
  };

  const value = {
    peerId,
    peer,
    localStream,
    remoteStream,
    isConnected,
    connectionStatus,
    remotePeerId,
    setRemotePeerId,
    copyPeerId,
    connectToPeer,
    disconnectCall,
    localVideoRef,
    remoteVideoRef,
  };

  return (
    <PeerContext.Provider value={value}>
      {children}
    </PeerContext.Provider>
  );
};