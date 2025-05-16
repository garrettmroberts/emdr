"use client";

import { useState } from 'react';
import AuthNav from "./AuthNav";
import HamburgerMenu from "./HamburgerMenu";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  return (
    <header className={`header ${menuOpen ? 'mobile-menu-open' : ''}`}>
      <h1 className="header__title">Tapioca EMDR</h1>
      
      <HamburgerMenu 
        isOpen={menuOpen} 
        toggleMenu={toggleMenu} 
      />
      
      <div className="header__auth-nav">
        <AuthNav isMenuOpen={menuOpen} />
      </div>
    </header>
  );
}