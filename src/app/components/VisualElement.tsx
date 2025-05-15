"use client";

import { useState, useEffect, useRef } from 'react';
import { usePeer } from '../context/PeerContext';

interface VisualElementProps {
  size?: number;       // Circle size in pixels
  speed?: number;      // Speed of movement (seconds for one full cycle)
  distance?: number;   // Distance to move (in pixels)
  color?: string;      // Color of the circle
  isActive?: boolean;  // Whether the animation is playing
  peerControlled?: boolean; // Whether it should be controlled by peer messages
}

const VisualElement: React.FC<VisualElementProps> = ({
  size = 50,
  speed = 2,
  distance = 300,
  color = '#4A90E2',
  isActive = true,
  peerControlled = true // Default to true since we want peer control
}) => {
  const [isAnimating, setIsAnimating] = useState(isActive);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get peer context to receive commands
  const { 
    animationActive, 
    startAnimation: startPeerAnimation,
    stopAnimation: stopPeerAnimation 
  } = usePeer();

  // Effect to handle peer-controlled animation
  useEffect(() => {
    if (peerControlled) {
      setIsAnimating(animationActive);
      
      if (animationActive) {
        setTimeRemaining(20);
        
        // Clear any existing timer
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        
        // Set a new timer to turn off animation after 20 seconds
        timerRef.current = setTimeout(() => {
          setIsAnimating(false);
          setTimeRemaining(null);
          timerRef.current = null;
          // Also notify peers animation has stopped
          stopPeerAnimation();
        }, 20000);
        
        // Update the countdown display every second
        const countdownInterval = setInterval(() => {
          setTimeRemaining(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(countdownInterval);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        // If peer stopped the animation, clear timer
        setTimeRemaining(null);
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }
    }
  }, [animationActive, peerControlled, stopPeerAnimation]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const circleStyle = {
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: color,
    '--distance': `${distance / 2}px`
  } as React.CSSProperties;

  const handleClick = () => {
    // If animation is currently off, turn it on and start timer
    if (!isAnimating) {
      if (peerControlled) {
        // Use peer control system to notify others too
        startPeerAnimation();
      } else {
        // Local-only animation control
        setIsAnimating(true);
        setTimeRemaining(20);
        
        // Clear any existing timer
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        
        // Set a new timer to turn off animation after 20 seconds
        timerRef.current = setTimeout(() => {
          setIsAnimating(false);
          setTimeRemaining(null);
          timerRef.current = null;
        }, 20000);
        
        // Update the countdown display every second
        const countdownInterval = setInterval(() => {
          setTimeRemaining(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(countdownInterval);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } else {
      // If animation is currently on, turn it off and clear timer
      if (peerControlled) {
        // Use peer control system to notify others too
        stopPeerAnimation();
      } else {
        // Local-only animation control
        setIsAnimating(false);
        setTimeRemaining(null);
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }
    }
  };

  return (
    <>
      <div className="container">
        {isAnimating && (
          <div 
            className={["circle", isAnimating ? "animate" : ''].join(' ')} 
            style={circleStyle} 
          />
        )}
      </div>
      <div className="controlContainer">
        <button className="button" onClick={handleClick}>
          {isAnimating ? `Stop (${timeRemaining ?? 20}s)` : 'Start Animation (20s)'}
        </button>
      </div>
    </>
  );
};

export default VisualElement;