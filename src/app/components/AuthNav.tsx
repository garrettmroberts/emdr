"use client";

import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function AuthNav() {
  const { user, userRole, signOut } = useAuth();
  
  return (
    <div className="authNav">
      {user ? (
        <div className="userInfo">
          <span className="userRole">
            {userRole === 'therapist' ? 'Therapist' : 'Client'}
          </span>
          <span className="userName">
            {user.email}
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