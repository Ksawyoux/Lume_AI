import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple Auth Context for development
// This is a mock version since Supabase is having integration issues
const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  hasCompletedOnboarding: false,
  completeOnboarding: () => {},
});

// Storage keys
const USER_STORAGE_KEY = '@lume_user';
const ONBOARDING_STORAGE_KEY = '@lume_onboarding_completed';

// Provider component that wraps the app and makes auth available
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Load stored user and onboarding status on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        // Load user from storage
        const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        // Load onboarding status
        const onboardingCompleted = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
        setHasCompletedOnboarding(onboardingCompleted === 'true');
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Register a new user
  const register = async ({ email, password, name }) => {
    setLoading(true);
    try {
      // For development, just create a mock user
      const newUser = {
        id: Date.now().toString(),
        email,
        user_metadata: {
          full_name: name,
        },
        created_at: new Date().toISOString(),
      };

      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      setUser(newUser);
      return { user: newUser };
    } catch (error) {
      console.error('Registration error:', error.message);
      throw new Error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Login a user
  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      // For development, simulate login with mock user
      const mockUser = {
        id: '12345',
        email,
        user_metadata: {
          full_name: 'Demo User',
        },
        created_at: new Date().toISOString(),
      };

      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
      setUser(mockUser);
      return { user: mockUser };
    } catch (error) {
      console.error('Login error:', error.message);
      throw new Error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Logout the current user
  const logout = async () => {
    setLoading(true);
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error.message);
      throw new Error('Logout failed');
    } finally {
      setLoading(false);
    }
  };

  // Mark onboarding as completed
  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  // Create the context value
  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    hasCompletedOnboarding,
    completeOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook for using the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}