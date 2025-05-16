"use client";

import { Dispatch, SetStateAction } from 'react';
import AuthNav from "./AuthNav";

interface HeaderProps {
  setAuthModalOpen: Dispatch<SetStateAction<boolean>>;
}

export default function Header({ setAuthModalOpen }: HeaderProps) {
  
  return (
    <header className="header">
      <h1 className="header__title">Tapioca EMDR</h1>
      <div className="header__auth-nav">
        <AuthNav setAuthModalOpen={setAuthModalOpen} />
      </div>
    </header>
  );
}