"use client";

import { FaShieldAlt, FaLaptopMedical, FaBrain, FaRegCommentDots } from 'react-icons/fa';

const Features = () => {
  return (
    <section className="features">
      <div className="features__header">
        <h2 className="features__title">Why Choose Tapioca EMDR?</h2>
        <p className="features__subtitle">Our platform combines security, simplicity, and clinical effectiveness</p>
      </div>
      
      <div className="features__grid">
        <div className="features__card">
          <div className="features__icon">
            <FaShieldAlt />
          </div>
          <h3 className="features__card-title">Secure & Private</h3>
          <p className="features__card-description">End-to-end encrypted video sessions ensure your therapy remains confidential and HIPAA-compliant.</p>
        </div>
        
        <div className="features__card">
          <div className="features__icon">
            <FaLaptopMedical />
          </div>
          <h3 className="features__card-title">Specialized for EMDR</h3>
          <p className="features__card-description">Custom-built bilateral stimulation tools designed specifically for online EMDR therapy.</p>
        </div>
        
        <div className="features__card">
          <div className="features__icon">
            <FaBrain />
          </div>
          <h3 className="features__card-title">Evidence-Based</h3>
          <p className="features__card-description">Built on research supporting the effectiveness of online EMDR therapy for trauma processing.</p>
        </div>
        
        <div className="features__card">
          <div className="features__icon">
            <FaRegCommentDots />
          </div>
          <h3 className="features__card-title">Easy Communication</h3>
          <p className="features__card-description">Simple interface for both therapists and clients with no software downloads required.</p>
        </div>
      </div>
    </section>
  );
};

export default Features; 