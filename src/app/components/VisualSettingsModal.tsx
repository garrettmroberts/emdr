import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { createPortal } from 'react-dom';

interface VisualSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: { color: string; size: number }) => void;
  initialColor?: string;
  initialSize?: number;
}

export default function VisualSettingsModal({
  isOpen,
  onClose,
  onSave,
  initialColor = '#169976',
  initialSize = 100
}: VisualSettingsModalProps) {
  const [color, setColor] = useState(initialColor);
  const [size, setSize] = useState(initialSize);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ color, size });
    onClose();
  };

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