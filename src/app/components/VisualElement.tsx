"use client";

import { useState, useEffect, useRef } from 'react';
import { usePeer } from '../context/PeerContext';

interface VisualElementProps {
  isActive: boolean;
  peerControlled?: boolean;
  color?: string;
  size?: number;
}

const VisualElement: React.FC<VisualElementProps> = ({
  isActive = false,
  peerControlled = false,
  color = '#169976',
  size = 100
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
    <div className="visual">
      <div 
        ref={ballRef} 
        className={`visual__ball visual__ball--moving`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          boxShadow: `0 0 20px ${color}99`
        }}
      ></div>
      {timeLeft !== null && (
        <div className="visual__timer">
          {timeLeft} seconds
        </div>
      )}
    </div>
  );
};

export default VisualElement;