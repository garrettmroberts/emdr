"use client";

import Image from 'next/image';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero__content">
        <div className="hero__text">
          <h1 className="hero__title">Transform Your Therapy Practice with Online EMDR</h1>
          <p className="hero__description">
            Provide effective EMDR therapy online through secure video sessions,
            bilateral stimulation tools, and an intuitive platform designed for therapists and clients.
          </p>
          <a href="/auth" className="hero__cta">
            <span className="hero__cta-highlight">Get Started</span> with Tapioca EMDR
          </a>
        </div>
        <div className="hero__visual">
          <div className="hero__circle hero__circle--primary"></div>
          <div className="hero__circle hero__circle--secondary"></div>
          <Image 
            src="/emdr-therapy-illustration.png" 
            alt="EMDR Therapy Illustration"
            className="hero__image"
            width={500} 
            height={300} 
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = 'none';
              if (target.parentElement) {
                target.parentElement.style.background = 'linear-gradient(135deg, rgba(29,205,159,0.2), rgba(22,153,118,0.2))';
                target.parentElement.style.borderRadius = '16px';
              }
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero; 