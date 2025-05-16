"use client";

import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import AuthModal from "./AuthModal";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    if (!isLoading && !user) {
      setShowModal(true);
    }
  }, [user, isLoading]);
  
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!user) {
    return <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} />;
  }
  
  return <>{children}</>;
}