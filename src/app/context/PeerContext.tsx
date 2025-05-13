"use client";

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import Peer, { MediaConnection, DataConnection } from 'peerjs';

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
  sendMessageToPeer: (message: string) => boolean;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  animationActive: boolean;
  startAnimation: () => void;
  stopAnimation: () => void;
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
  const [animationActive, setAnimationActive] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const activeCalls = useRef<Map<string, MediaConnection>>(new Map());
  const pendingCalls = useRef<Array<MediaConnection>>([]);
  const dataConnections = useRef<Map<string, DataConnection>>(new Map());

  useEffect(() => {
    const peerId = Math.random().toString(36).substring(2, 10);
    setPeerId(peerId);
  }, []);

  useEffect(() => {
    if (peerId) {
      getUserMedia().then(() => {
        createPeer(peerId);
      }).catch(err => {
        console.error('Failed to get user media:', err);
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
      dataConnections.current.forEach((conn) => {
        conn.close();
      });
      dataConnections.current.clear();
    };
  }, [peerId]);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      console.log('Setting remote stream to video element');
      remoteVideoRef.current.srcObject = remoteStream;
      
      remoteVideoRef.current.play().catch(err => {
        console.error('Error playing remote video:', err);
      });
    }
  }, [remoteStream]);

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

  const setupDataConnectionListeners = (conn: DataConnection) => {
    conn.on('data', (data) => {
      console.log('Received data:', data);
      
      // Handle animation control messages
      if (typeof data === 'string') {
        if (data.includes('start-animation')) {
          console.log('Received animation start command');
          setAnimationActive(true);
        } else if (data.includes('stop-animation')) {
          console.log('Received animation stop command');
          setAnimationActive(false);
        }
      }
    });
    
    conn.on('close', () => {
      console.log('Data connection closed:', conn.peer);
      dataConnections.current.delete(conn.peer);
    });
    
    conn.on('error', (err) => {
      console.error('Data connection error:', err);
    });
    
    dataConnections.current.set(conn.peer, conn);
  };

  const getOrCreateDataConnection = (peerId: string): DataConnection | null => {
    if (dataConnections.current.has(peerId)) {
      return dataConnections.current.get(peerId) || null;
    }
    
    if (!peer) {
      console.error('Cannot create data connection: Peer not initialized');
      return null;
    }
    
    try {
      const conn = peer.connect(peerId);
      
      conn.on('open', () => {
        console.log('Data connection opened with:', peerId);
      });
      
      setupDataConnectionListeners(conn);
      return conn;
    } catch (err) {
      console.error('Failed to create data connection:', err);
      return null;
    }
  };

  const sendMessageToPeer = (message: string): boolean => {
    if (!remotePeerId) {
      console.error('Cannot send message: No remote peer specified');
      return false;
    }
    
    const conn = getOrCreateDataConnection(remotePeerId);
    if (!conn) {
      return false;
    }
    
    try {
      if (conn.open) {
        conn.send(message);
        console.log('Message sent:', message);
        return true;
      } else {
        conn.on('open', () => {
          conn.send(message);
          console.log('Message sent after connection opened:', message);
        });
        return true;
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      return false;
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
      
      newPeer.on('call', (call) => {
        console.log('Incoming call from:', call.peer);
        
        if (localStream) {
          answerCall(call);
        } else {
          console.log('No local stream available yet, adding call to pending queue');
          setConnectionStatus('Getting camera access to answer call...');
          pendingCalls.current.push(call);
          
          getUserMedia().then(() => {});
        }
      });
      
      newPeer.on('connection', (conn) => {
        console.log('Incoming data connection from:', conn.peer);
        setupDataConnectionListeners(conn);
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
    
    activeCalls.current.set(call.peer, call);
    
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

  const startAnimation = () => {
    setAnimationActive(true);
    sendMessageToPeer('start-animation');
  };

  const stopAnimation = () => {
    setAnimationActive(false);
    sendMessageToPeer('stop-animation');
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
    sendMessageToPeer,
    localVideoRef,
    remoteVideoRef,
    animationActive,
    startAnimation,
    stopAnimation,
  };

  return (
    <PeerContext.Provider value={value}>
      {children}
    </PeerContext.Provider>
  );
};