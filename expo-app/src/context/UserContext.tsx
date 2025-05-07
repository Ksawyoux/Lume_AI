import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { User } from '../models/schema';
import { fetcher } from '../lib/db';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for saved user session on app launch
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real app, you would check for a stored token
        // and validate it with your backend
        setIsLoading(false);
      } catch (error) {
        console.error('Authentication error:', error);
        setUser(null);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    try {
      const response = await fetcher<{ user: User }>({
        url: '/login',
        method: 'POST',
        body: { username, password },
      });
      
      setUser(response.user);
      return response.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear any stored auth tokens
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, isLoading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}