"use client";

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client'); // Default to client role
  const [error, setError] = useState('');
  const { signIn, signUp, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, role); // Pass the selected role
      }
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="authContainer">
      <div className="authForm">
        <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
        
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="formGroup">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="formGroup">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {/* Only show role selection during signup */}
          {!isLogin && (
            <div className="formGroup">
              <label className="roleLabel">I am a:</label>
              <div className="roleOptions">
                <label className="roleOption">
                  <input
                    type="radio"
                    name="role"
                    value="client"
                    checked={role === 'client'}
                    onChange={() => setRole('client')}
                  />
                  <span>Client</span>
                </label>
                
                <label className="roleOption">
                  <input
                    type="radio"
                    name="role"
                    value="therapist"
                    checked={role === 'therapist'}
                    onChange={() => setRole('therapist')}
                  />
                  <span>Therapist</span>
                </label>
              </div>
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="submitButton"
          >
            {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        
        <div className="switchMode">
          {isLogin ? (
            <p>
              Don&apos;t have an account?{' '}
              <button onClick={() => setIsLogin(false)}>Sign Up</button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button onClick={() => setIsLogin(true)}>Login</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}