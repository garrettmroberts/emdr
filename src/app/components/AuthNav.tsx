"use client";

import { useState, Dispatch, SetStateAction } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePeer } from '../context/PeerContext';
import AuthModal from './AuthModal';

interface AuthNavProps {
  setAuthModalOpen: Dispatch<SetStateAction<boolean>>;
}

export default function AuthNav({ setAuthModalOpen }: AuthNavProps) {
  const { user, userRole, signOut } = useAuth();
  const { peerId, localStream } = usePeer();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleSignOut = () => {
    // Stop all tracks in the local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    // Sign out
    signOut();
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
    setAuthModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setAuthModalOpen(false);
  };
  
  return (
    <div className="authNav">
      {user ? (
        <div className="userInfo">
          <span className="userRole">
            {userRole === 'therapist' ? 'Therapist' : 'Client'}
          </span>
          <span className="userName">
            {peerId}
          </span>
          <a href="/profile" className="profileLink">
            Profile
          </a>
          <button 
            onClick={handleSignOut} 
            className="authButton"
          >
            Logout
          </button>
        </div>
      ) : (
        <>
          <button 
            onClick={handleModalOpen} 
            className="authButton"
          >
            Login
          </button>
          <AuthModal 
            isOpen={isModalOpen} 
            onClose={handleModalClose} 
          />
        </>
      )}
    </div>
  );
}