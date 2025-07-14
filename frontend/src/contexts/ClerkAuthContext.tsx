import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import axios from 'axios';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  bio?: string;
  profile_picture?: string;
  timezone: string;
  email_notifications: boolean;
  reminder_time: string;
  date_joined: string;
  last_login?: string;
}

interface ClerkAuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  syncUserWithBackend: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const ClerkAuthContext = createContext<ClerkAuthContextType | undefined>(undefined);

export const useClerkAuth = () => {
  const context = useContext(ClerkAuthContext);
  if (context === undefined) {
    throw new Error('useClerkAuth must be used within a ClerkAuthProvider');
  }
  return context;
};

interface ClerkAuthProviderProps {
  children: ReactNode;
}

export const ClerkAuthProvider: React.FC<ClerkAuthProviderProps> = ({ children }) => {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { getToken } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!clerkUser;



  // Sync Clerk user with backend
  const syncUserWithBackend = async () => {
    if (!clerkUser) {
      setUser(null);
      return;
    }

    try {
      // Get Clerk token
      const token = await getToken();
      
      // Set token in localStorage for API calls
      if (token) {
        localStorage.setItem('clerk_token', token);
      }

      // Create axios instance for this request
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      const api = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      // Try to get user profile from backend
      try {
        const response = await api.get('/users/profile/');
        setUser(response.data);
      } catch (error) {
        // If user doesn't exist in backend, create them
        await createUserInBackend(token);
      }
    } catch (error) {
      console.error('Error syncing user with backend:', error);
    }
  };

  const createUserInBackend = async (token: string) => {
    if (!clerkUser) return;

    try {
      // Create axios instance for this request
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      const api = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      // The backend will automatically create the user when they first access a protected endpoint
      // So we just need to make a request to trigger user creation
      const response = await api.get('/users/profile/');
      setUser(response.data);
    } catch (error) {
      console.error('Error creating user in backend:', error);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const token = localStorage.getItem('clerk_token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      const api = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const response = await api.put('/users/profile/update/', data);
      setUser(response.data);
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  // Sync user when Clerk user changes
  useEffect(() => {
    if (clerkLoaded) {
      syncUserWithBackend().finally(() => {
        setIsLoading(false);
      });
    }
  }, [clerkUser, clerkLoaded]);

  const value: ClerkAuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    syncUserWithBackend,
    updateProfile,
  };

  return (
    <ClerkAuthContext.Provider value={value}>
      {children}
    </ClerkAuthContext.Provider>
  );
}; 