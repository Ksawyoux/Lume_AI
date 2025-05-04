import { createContext, useState, useContext, ReactNode } from 'react';
import { User } from '@/types';
import { useQuery } from '@tanstack/react-query';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  // Auto-login the demo user for demonstration purposes
  const { isLoading } = useQuery({
    queryKey: ['/api/login'],
    queryFn: async () => {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'demo',
          password: 'password',
        }),
        credentials: 'include',
      });
      
      if (!res.ok) {
        throw new Error('Failed to login');
      }
      
      const data = await res.json();
      setUser(data.user);
      return data;
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
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
