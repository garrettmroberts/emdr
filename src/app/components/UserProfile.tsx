"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSupabase } from '../hooks/useSupabase';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, userRole, isLoading } = useAuth();
  const { supabase } = useSupabase();
  const router = useRouter();
  
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: userRole || 'client'
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
    }
    
    const loadProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (data) {
        setProfile({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          email: user.email || '',
          role: data.role || userRole || 'client'
        });
      } else if (error) {
        console.error('Error loading profile:', error);
      }
    };
    
    loadProfile();
  }, [user, isLoading, router, supabase, userRole]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    
    try {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.firstName,
          last_name: profile.lastName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) throw error;
      setMessage('Profile updated successfully');
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return <div>Loading profile...</div>;
  }
  
  return (
    <div className="profileContainer">
      <div className="profileCard">
        <h1>Your Profile</h1>
        
        {message && (
          <div className={message.includes('Error') ? "error" : "success"}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="formGroup">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="disabledInput"
            />
          </div>
          
          <div className="formGroup">
            <label htmlFor="role">Role</label>
            <input
              id="role"
              type="text"
              value={profile.role === 'therapist' ? 'Therapist' : 'Client'}
              disabled
              className="disabledInput"
            />
          </div>
          
          <div className="formGroup">
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              value={profile.firstName}
              onChange={(e) => setProfile({...profile, firstName: e.target.value})}
            />
          </div>
          
          <div className="formGroup">
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              value={profile.lastName}
              onChange={(e) => setProfile({...profile, lastName: e.target.value})}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isSaving}
            className="saveButton"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}