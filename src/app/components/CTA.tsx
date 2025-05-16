"use client";

import { useState, Dispatch, SetStateAction } from 'react';
import AuthModal from './AuthModal';

interface CTAProps {
  setAuthModalOpen: Dispatch<SetStateAction<boolean>>;
}

const CTA = ({ setAuthModalOpen }: CTAProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalOpen = () => {
    setIsModalOpen(true);
    setAuthModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setAuthModalOpen(false);
  };

  return (
    <section className="cta">
      <h2 className="cta__title">Ready to Elevate Your Therapy Practice?</h2>
      <p className="cta__description">Join therapists worldwide who are expanding their reach and improving outcomes with Tapioca EMDR</p>
      <button 
        onClick={handleModalOpen} 
        className="cta__button"
      >
        Start Your Journey Today
      </button>
      <AuthModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
      />
    </section>
  );
};

export default CTA; 