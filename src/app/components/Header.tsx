"use client";

import AuthNav from "./AuthNav";

export default function Header() {
  
  return (
    <header className="header">
      <h1 className="header__title">Tapioca EMDR</h1>
      <div className="header__auth-nav">
        <AuthNav />
      </div>
    </header>
  );
}