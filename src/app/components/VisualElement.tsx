"use client";

import { useState, useEffect, useRef } from 'react';
import styles from './VisualElement.module.css';

interface VisualElementProps {
  size?: number;       // Circle size in pixels
  speed?: number;      // Speed of movement (seconds for one full cycle)
  distance?: number;   // Distance to move (in pixels)
  color?: string;      // Color of the circle
  isActive?: boolean;  // Whether the animation is playing
}

const VisualElement: React.FC<VisualElementProps> = ({
  size = 50,
  color = '#4A90E2',
  isActive = true
}) => {
  const [isAnimating, setIsAnimating] = useState(isActive);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
  };

  const handleClick = () => {
    // If animation is currently off, turn it on and start timer
    if (!isAnimating) {
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
      
      // Optional: update the countdown display every second
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
      // If animation is currently on, turn it off and clear timer
      setIsAnimating(false);
      setTimeRemaining(null);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div 
          className={[styles.circle, isAnimating ? styles.animate : ''].join(' ')} 
          style={circleStyle} 
        />
      </div>
      <div className={styles.controlContainer}>
        <button className={styles.button} onClick={handleClick}>
          {isAnimating ? `Stop (${timeRemaining ?? 20}s)` : 'Start Animation (20s)'}
        </button>
      </div>
    </>
  );
};

export default VisualElement;