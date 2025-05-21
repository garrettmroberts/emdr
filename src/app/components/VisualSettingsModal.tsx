import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { createPortal } from 'react-dom';

interface VisualSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: { color: string; size: number; duration: number }) => void;
  initialSettings?: { color: string; size: number; duration: number };
}

export default function VisualSettingsModal({
  isOpen,
  onClose,
  onSettingsChange,
  initialSettings = { color: '#169976', size: 100, duration: 20 }
}: VisualSettingsModalProps) {
  const [color, setColor] = useState(initialSettings.color);
  const [size, setSize] = useState(initialSettings.size);
  const [duration, setDuration] = useState(initialSettings.duration);

  useEffect(() => {
    if (isOpen) {
      setColor(initialSettings.color);
      setSize(initialSettings.size);
      setDuration(initialSettings.duration);
    }
  }, [isOpen, initialSettings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSettingsChange({ color, size, duration });
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="modal">
      <div className="modal__overlay" onClick={onClose} />
      <div className="modal__content">
        <button className="modal__close" onClick={onClose}>
          <FaTimes />
        </button>
        <h3>Visual Settings</h3>
        <form onSubmit={handleSubmit}>
          <div className="formGroup">
            <label htmlFor="color">Color</label>
            <input
              type="color"
              id="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
          <div className="formGroup">
            <label htmlFor="size">Size (px)</label>
            <input
              type="range"
              id="size"
              min="50"
              max="200"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            />
            <span className="sizeValue">{size}px</span>
          </div>
          <div className="formGroup">
            <label htmlFor="duration">Duration (seconds)</label>
            <input
              type="range"
              id="duration"
              min="5"
              max="60"
              step="5"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
            <span className="sizeValue">{duration}s</span>
          </div>
          <div className="buttonGroup">
            <button type="submit" className="saveButton">Save Settings</button>
          </div>
        </form>
      </div>
    </div>
  );

  // Use createPortal to render the modal at the root level
  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
} 