"use client";

import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import styles from './Toast.module.css';
import { FaEnvelope, FaTimes } from 'react-icons/fa';

interface ToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

export default function Toast({ 
  message, 
  visible, 
  onClose,
  type = 'info',
  duration = 5000 
}: ToastProps) {

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);
  
  if (!visible) return null;

  return ReactDOM.createPortal(
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.content}>
        <FaEnvelope className={styles.icon} />
        <span>{message}</span>
      </div>
      <button onClick={onClose} className={styles.closeBtn}>
        <FaTimes />
      </button>
    </div>,
    document.body
  );
}