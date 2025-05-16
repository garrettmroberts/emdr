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
  const { animationActive } = usePeer();
  
  // Determine if the ball should be active based on who controls it
  const showBall = peerControlled ? animationActive : isActive;
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  
  // Timer logic
  useEffect(() => {
    if (showBall) {
      // Start with 20 seconds
      setTimeLeft(20);
      
      // Clear any existing timer
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      // Set up the countdown timer
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev && prev > 1) return prev - 1;
          return null;
        });
      }, 1000);
    } else {
      // Clean up if ball is hidden
      setTimeLeft(null);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    
    // Cleanup on unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [showBall]);

  // Don't render anything if not active
  if (!showBall) return null;
  
  return (
    <div className={styles.container}>
      <div 
        ref={ballRef} 
        className={`${styles.ball} ${styles.moving}`}
      ></div>
      {timeLeft !== null && (
        <div className={styles.timer}>
          {timeLeft} seconds
        </div>
      )}
    </div>
  );
};

export default VisualElement;