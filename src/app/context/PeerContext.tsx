"use client";

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import Peer, { MediaConnection, DataConnection } from 'peerjs';
import { useAuth } from './AuthContext';

const DEBUG_PREFIX = '🔄 [PEER DEBUG]';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const debugLog = (...args: any[]) => {
  console.log(DEBUG_PREFIX, ...args);
};

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
  remoteVideoEnabled: boolean;
  isCallRinging: boolean;
  incomingCall: MediaConnection | null;
  acceptCall: () => void;
  rejectCall: () => void;
  updateLocalStream: (newStream: MediaStream) => void;
}

export const PeerContext = createContext<PeerContextType | null>(null);

export const usePeer = () => {
  const context = useContext(PeerContext);
  if (!context) {
    throw new Error('usePeer must be used within a PeerProvider');
  }
  return context;
};

export const PeerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [peerId, setPeerId] = useState<string | null>(null);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remotePeerId, setRemotePeerId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const [animationActive, setAnimationActive] = useState(false);
  const [remoteVideoEnabled, setRemoteVideoEnabled] = useState<boolean>(true);
  const [incomingCall, setIncomingCall] = useState<MediaConnection | null>(null);
  const [isCallRinging, setIsCallRinging] = useState<boolean>(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const activeCalls = useRef<Map<string, MediaConnection>>(new Map());
  const pendingCalls = useRef<Array<MediaConnection>>([]);
  const dataConnections = useRef<Map<string, DataConnection>>(new Map());

  useEffect(() => {
    debugLog(`Setting up peer ID: ${user?.email ? 'Using email' : 'Using random ID'}`);
    if (user?.email) {
      const sanitizedEmail = user.email.replace(/[^a-zA-Z0-9]/g, '-');
      setPeerId(sanitizedEmail);
    } else {
      const randomId = Math.random().toString(36).substring(2, 10);
      setPeerId(randomId);
    }
  }, [user]);

  useEffect(() => {
    if (peerId) {
      debugLog(`Initializing peer with ID: ${peerId}`);
      createPeer(peerId);
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

  // Request camera access immediately after login
  useEffect(() => {
    if (user && !localStream) {
      debugLog('User logged in, requesting camera access');
      getUserMedia().catch(err => {
        console.error(`${DEBUG_PREFIX} Initial media access error:`, err);
        setConnectionStatus(`Camera access error: ${err?.name || err?.message || err}`);
      });
    }
  }, [user]);

  const getUserMedia = async () => {
    // Only request media if user is logged in
    if (!user) {
      throw new Error('Must be logged in to access media devices');
    }

    debugLog('Requesting user media with enhanced quality...');
    try {
      debugLog('MediaDevices API available:', !!navigator.mediaDevices);
      
      const constraints = { 
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 15 },
          facingMode: 'user',
          aspectRatio: { ideal: 1.7778 }, // 16:9
        }, 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 2,
          sampleRate: 48000,
          sampleSize: 16
        } 
      };
      
      debugLog('Using enhanced constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      debugLog(`Got local stream ID: ${stream.id}`);
      setLocalStream(stream);
      setConnectionStatus('Camera and microphone ready');
      return stream;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(`${DEBUG_PREFIX} Media access error:`, err);
      setConnectionStatus(`Media access error: ${err?.name || err?.message || err}`);
      throw err;
    }
  };

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
      handleDataMessage(data as string);
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

  const setupDataChannel = (conn: DataConnection) => {
    conn.on('data', (data) => {
      handleDataMessage(data as string);
    });
  };

  const handleDataMessage = (data: string) => {
    console.log('Message received:', data);

    if (data === 'start-visual') {
      console.log('Starting visual animation');
      setAnimationActive(true);

      setTimeout(() => {
        setAnimationActive(false);
      }, 20000);
    } else if (data === 'stop-visual') {
      setAnimationActive(false);
    } else if (data === 'video-disabled') {
      setRemoteVideoEnabled(false);
    } else if (data === 'video-enabled') {
      setRemoteVideoEnabled(true);
    }
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

  const createPeer = async (peerId: string) => {
    debugLog(`Creating peer with ID: ${peerId}`);
    
    // Default ICE servers as fallback
    let iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.google.com:19302' },
    ];
    
    try {
      // Fetch Twilio TURN credentials
      const response = await fetch('/api/twilio-token');
      if (response.ok) {
        const data = await response.json();
        if (data.iceServers) {
          debugLog('Using Twilio ICE servers');
          iceServers = data.iceServers;
        }
      } else {
        console.error(`${DEBUG_PREFIX} Failed to get Twilio servers:`, await response.text());
      }
    } catch (err) {
      console.error(`${DEBUG_PREFIX} Error fetching Twilio credentials:`, err);
      debugLog('Falling back to public STUN servers');
    }
    
    const config = {
      config: {
        iceServers,
        iceCandidatePoolSize: 10,
      },
      debug: 3
    };
    
    debugLog('Peer configuration:', config);
    const newPeer = new Peer(peerId, config);

    newPeer.on('open', (id) => {
      debugLog(`Peer connection opened with ID: ${id}`);
      setPeer(newPeer);

      newPeer.on('call', (call) => {
        debugLog(`Incoming call from: ${call.peer}`);
        setRemotePeerId(call.peer);
        setIncomingCall(call);
        setIsCallRinging(true);
        setConnectionStatus(`Incoming call from ${call.peer}...`);
        
        // Set a timeout to automatically reject the call after 30 seconds if not answered
        const callTimeout = setTimeout(() => {
          if (isCallRinging) {
            debugLog('Call not answered within timeout period');
            setIsCallRinging(false);
            setIncomingCall(null);
            setConnectionStatus('Missed call');
          }
        }, 30000);
        
        // Clear the timeout when component unmounts or call is handled
        return () => clearTimeout(callTimeout);
      });

      newPeer.on('connection', (conn) => {
        debugLog(`Incoming data connection from: ${conn.peer}`);
        debugLog(`Connection ready state: ${conn.open ? 'open' : 'not open'}`);
        setupDataConnectionListeners(conn);
        setupDataChannel(conn);
      });
    });

    newPeer.on('error', (err) => {
      console.error(`${DEBUG_PREFIX} Peer error:`, err);
      debugLog(`Error type: ${err.type}, Error message: ${err.message}`);
      setConnectionStatus(`Error: ${err.type} - ${err.message || ''}`);
    });

    newPeer.on('disconnected', () => {
      debugLog('Peer disconnected from server');
      setConnectionStatus('Disconnected from server');
    });

    newPeer.on('close', () => {
      debugLog('Peer connection closed');
      setConnectionStatus('Connection closed');
    });

    setPeer(newPeer);
  };

  const answerCall = (call: MediaConnection) => {
    debugLog(`Answering call from ${call.peer}`);
    if (!localStream) {
      console.error(`${DEBUG_PREFIX} Cannot answer call without local stream`);
      return;
    }

    setConnectionStatus(`Answering call from ${call.peer}...`);
    setRemotePeerId(call.peer);

    activeCalls.current.set(call.peer, call);

    debugLog(`Answering call with stream ID: ${localStream.id}`);
    call.answer(localStream);

    call.on('stream', (incomingStream) => {
      debugLog(`Received remote stream ID: ${incomingStream.id}`);
      debugLog(`Remote stream tracks: video=${incomingStream.getVideoTracks().length}, audio=${incomingStream.getAudioTracks().length}`);
      setRemoteStream(incomingStream);
      setIsConnected(true);
      setConnectionStatus(`Connected to ${call.peer}`);
    });

    call.on('close', () => {
      debugLog(`Call from ${call.peer} closed`);
      setIsConnected(false);
      setRemoteStream(null);
      setConnectionStatus('Call ended');
      activeCalls.current.delete(call.peer);
    });

    call.on('error', (err) => {
      console.error(`${DEBUG_PREFIX} Call error:`, err);
      setConnectionStatus(`Call error: ${err}`);
    });
  };

  const callPeer = async (remotePeerId: string) => {
    debugLog(`Attempting to call peer: ${remotePeerId}`);
    
    // Get media access when initiating a call
    try {
      if (!localStream) {
        await getUserMedia();
      }

      if (!peer) {
        console.error(`${DEBUG_PREFIX} Cannot call: Peer not initialized`);
        return;
      }

      if (!localStream) {
        console.error(`${DEBUG_PREFIX} Failed to get local stream`);
        return;
      }

      setConnectionStatus(`Calling ${remotePeerId}...`);
      
      // Create optimized stream with lower bitrate for better reliability
      const optimizedStream = new MediaStream();
      
      // Add tracks from the localStream to the optimizedStream
      localStream.getTracks().forEach(track => {
        debugLog(`Adding track to optimized stream: ${track.kind}, enabled=${track.enabled}`);
        optimizedStream.addTrack(track);
      });
      
      debugLog(`Calling with optimized stream ID: ${optimizedStream.id}, tracks: video=${optimizedStream.getVideoTracks().length}, audio=${optimizedStream.getAudioTracks().length}`);
      
      const call = peer.call(remotePeerId, optimizedStream);
      activeCalls.current.set(remotePeerId, call);
      
      // Add ICE candidate monitoring
      if (call.peerConnection) {
        // Log ICE candidate types to help diagnose connection issues
        const candidateCounter = { host: 0, srflx: 0, relay: 0 };
        
        call.peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            const candidateType = event.candidate.candidate.split(' ')[7];
            if (candidateType in candidateCounter) {
              candidateCounter[candidateType as keyof typeof candidateCounter]++;
            }
            if (candidateType in candidateCounter) {
              debugLog(`ICE candidate generated: ${candidateType} (${candidateCounter[candidateType as keyof typeof candidateCounter]})`);
            } else {
              debugLog(`ICE candidate generated: ${candidateType} (unknown type)`);
            }
          }
        };
        
        call.peerConnection.onicegatheringstatechange = () => {
          if (call.peerConnection.iceGatheringState === 'complete') {
            debugLog('ICE gathering complete. Candidates collected:', candidateCounter);
            
            if (candidateCounter.relay === 0) {
              debugLog('WARNING: No relay candidates collected - TURN servers may not be working');
            }
          }
        };
        
        // Monitor connection state
        call.peerConnection.onconnectionstatechange = () => {
          debugLog(`Connection state changed: ${call.peerConnection.connectionState}`);
        };
      }
      
      // Handle the incoming stream
      call.on('stream', (incomingStream) => {
        debugLog(`Received remote stream ID: ${incomingStream.id}`);
        debugLog(`Remote stream tracks: video=${incomingStream.getVideoTracks().length}, audio=${incomingStream.getAudioTracks().length}`);
        setRemoteStream(incomingStream);
        setIsConnected(true);
        setConnectionStatus(`Connected to ${call.peer}`);
      });
      
      // Handle call closing
      call.on('close', () => {
        debugLog(`Call to ${remotePeerId} closed`);
        setIsConnected(false);
        setRemoteStream(null);
        setConnectionStatus('Call ended');
        activeCalls.current.delete(remotePeerId);
      });
      
      // Handle call errors
      call.on('error', (err) => {
        console.error(`${DEBUG_PREFIX} Call error:`, err);
        setConnectionStatus(`Call error: ${err}`);
      });
    } catch (err) {
      console.error(`${DEBUG_PREFIX} Error in callPeer:`, err);
      setConnectionStatus('Failed to establish call');
    }
  };

  const disconnectCall = () => {
    debugLog(`Disconnecting all calls: ${activeCalls.current.size} active calls`);
    activeCalls.current.forEach((call, peerId) => {
      debugLog(`Closing call with ${peerId}`);
      call.close();
    });
    activeCalls.current.clear();

    // Clear the remote video element
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setIsConnected(false);
    setRemoteStream(null);
    setConnectionStatus('Disconnected');
  };

  const connectToPeer = (id: string = remotePeerId) => {
    if (id) {
      debugLog(`Connecting to peer: ${id}`);
      callPeer(id);

      debugLog('Creating data connection');
      const conn = peer?.connect(id);
      if (conn) {
        debugLog(`Data connection created, waiting for open`);
        conn.on('open', () => {
          debugLog(`Data connection opened with ${id}`);
          setupDataChannel(conn);
        });
      } else {
        debugLog('Failed to create data connection');
      }
    } else {
      debugLog('Cannot connect: No remote peer ID specified');
    }
  };

  const startAnimation = () => {
    setAnimationActive(true);
    sendMessageToPeer('start-visual');
  };

  const stopAnimation = () => {
    setAnimationActive(false);
    sendMessageToPeer('stop-visual');
  };

  const acceptCall = async () => {
    if (!incomingCall) {
      debugLog('No incoming call to accept');
      return;
    }
    
    debugLog(`Accepting call from ${incomingCall.peer}`);
    setIsCallRinging(false);
    
    // Ensure we have media access
    if (!localStream) {
      try {
        debugLog('Getting media for incoming call');
        setConnectionStatus('Getting camera access...');
        await getUserMedia();
      } catch (err) {
        console.error(`${DEBUG_PREFIX} Failed to get media for accepting call:`, err);
        setConnectionStatus('Failed to access camera/mic');
        return;
      }
    }
    
    // Answer the call
    answerCall(incomingCall);
    setIncomingCall(null);
  };

  const rejectCall = () => {
    if (!incomingCall) {
      return;
    }
    
    debugLog(`Rejecting call from ${incomingCall.peer}`);
    // Close the connection
    incomingCall.close();
    setIncomingCall(null);
    setIsCallRinging(false);
    setConnectionStatus('Call rejected');
  };

  const updateLocalStream = (newStream: MediaStream) => {
    debugLog('Updating local stream');
    setLocalStream(newStream);
    
    // Update all active calls with the new stream
    activeCalls.current.forEach((call, peerId) => {
      if (call.open && call.peerConnection) {
        debugLog(`Updating stream for call with ${peerId}`);
        
        // Get the sender for each track type
        const senders = call.peerConnection.getSenders();
        
        // Replace each track
        newStream.getTracks().forEach(newTrack => {
          const sender = senders.find(s => s.track?.kind === newTrack.kind);
          if (sender) {
            debugLog(`Replacing ${newTrack.kind} track`);
            sender.replaceTrack(newTrack).catch(err => {
              console.error(`Error replacing ${newTrack.kind} track:`, err);
            });
          }
        });
      }
    });
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
    remoteVideoEnabled,
    isCallRinging,
    incomingCall,
    acceptCall,
    rejectCall,
    updateLocalStream
  };

  return (
    <PeerContext.Provider value={value}>
      {children}
    </PeerContext.Provider>
  );
};