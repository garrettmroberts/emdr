"use client";

import { useEffect } from 'react';
import ReactDOM from 'react-dom';
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
    <div className={`toast toast--${type}`}>
      <div className="toast__content">
        <FaEnvelope className="toast__icon" />
        <span>{message}</span>
      </div>
      <button onClick={onClose} className="toast__close">
        <FaTimes />
      </button>
    </div>,
    document.body
  );
}