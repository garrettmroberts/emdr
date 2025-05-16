"use client";

import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { usePeer } from '../context/PeerContext';

interface AuthNavProps {
  isMenuOpen?: boolean;
}

export default function AuthNav({ isMenuOpen = false }: AuthNavProps) {
  const { user, userRole, signOut } = useAuth();
  const { peerId } = usePeer();
  
  return (
    <div className={`authNav ${isMenuOpen ? 'menu-open' : ''}`}>
      {user ? (
        <div className="userInfo">
          <span className="userRole">
            {userRole === 'therapist' ? 'Therapist' : 'Client'}
          </span>
          <span className="userName">
            {peerId}
          </span>
          <Link href="/profile" className="profileLink">
            Profile
          </Link>
          <button 
            onClick={signOut} 
            className="authButton"
          >
            Logout
          </button>
        </div>
      ) : (
        <Link 
          href="/auth" 
          className="authButton"
        >
          Login
        </Link>
      )}
    </div>
  );
}