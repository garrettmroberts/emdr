"use client";

import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import styles from './AuthNav.module.css';

export default function AuthNav() {
  const { user, userRole, signOut } = useAuth();
  
  return (
    <div className={styles.authNav}>
      {user ? (
        <div className={styles.userInfo}>
          <span className={styles.userRole}>
            {userRole === 'therapist' ? 'Therapist' : 'Client'}
          </span>
          <span className={styles.userName}>
            {user.email}
          </span>
          <Link href="/profile" className={styles.profileLink}>
            Profile
          </Link>
          <button 
            onClick={signOut} 
            className={styles.authButton}
          >
            Logout
          </button>
        </div>
      ) : (
        <Link 
          href="/auth" 
          className={styles.authButton}
        >
          Login
        </Link>
      )}
    </div>
  );
}