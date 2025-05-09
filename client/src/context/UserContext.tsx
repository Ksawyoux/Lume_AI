import { createContext, useContext, ReactNode } from 'react';
import { User } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  // Use the auth context to manage the user state
  const { user, isLoading, logoutMutation } = useAuth();
  
  // This is only kept for backward compatibility with existing components
  // New components should use useAuth() directly
  const setUser = (newUser: User | null) => {
    console.warn('setUser in UserContext is deprecated. Use useAuth() instead.');
  };
  
  const logout = () => {
    logoutMutation.mutate();
  };

  return (
    <UserContext.Provider value={{ user, setUser, isLoading, logout }}>
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
