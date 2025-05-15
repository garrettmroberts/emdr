"use client";

import { useState, useEffect, useRef } from 'react';
import { usePeer } from '../context/PeerContext';
import styles from './VisualElement.module.css';

interface VisualElementProps {
  isActive: boolean;
  peerControlled?: boolean;
}

const VisualElement: React.FC<VisualElementProps> = ({
  isActive = false,
  peerControlled = false
}) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { animationActive } = usePeer();
  
  // Determine if the ball should be active based on who controls it
  const showBall = peerControlled ? animationActive : isActive;
  
  // Set up and clean up timers
  useEffect(() => {
    if (showBall) {
      // Start with 20 seconds
      setTimeLeft(20);
      
      // Clear any existing timers
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      // Set up the countdown timer
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev && prev > 1) return prev - 1;
          return null;
        });
      }, 1000);
      
      // Set timer to auto-stop after 20 seconds
      timerRef.current = setTimeout(() => {
        setTimeLeft(null);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }, 20000);
    } else {
      // Clean up if ball is hidden
      setTimeLeft(null);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    
    // Cleanup on unmount
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [showBall]);

  // Don't render anything if not active
  if (!showBall) return null;
  
  return (
    <div className={styles.container}>
      <div className={`${styles.ball} ${styles.moving}`}></div>
      {timeLeft !== null && (
        <div className={styles.timer}>
          {timeLeft} seconds
        </div>
      )}
    </div>
  );
};

export default VisualElement;