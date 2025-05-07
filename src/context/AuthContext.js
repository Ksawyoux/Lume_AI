import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

// Create a fallback localStorage implementation for environments
// where AsyncStorage is not available (web)
const localStorage = {
  async getItem(key) {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      // Fallback to browser localStorage if AsyncStorage fails
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return null;
    }
  },
  async setItem(key, value) {
    try {
      return await AsyncStorage.setItem(key, value);
    } catch (e) {
      // Fallback to browser localStorage if AsyncStorage fails
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.setItem(key, value);
      }
    }
  },
  async removeItem(key) {
    try {
      return await AsyncStorage.removeItem(key);
    } catch (e) {
      // Fallback to browser localStorage if AsyncStorage fails
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.removeItem(key);
      }
    }
  },
};

// Create the auth context
const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  forgotPassword: async () => {},
  resetPassword: async () => {},
});

// Provider component that wraps the app and makes auth available
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes when the component mounts
  useEffect(() => {
    let mounted = true;
    
    // Check for existing session
    const checkSession = async () => {
      setLoading(true);
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error.message);
          throw error;
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user || null);
        }
      } catch (error) {
        console.error('Session retrieval error:', error.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    checkSession();
    
    // Set up a subscription to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setSession(session);
          setUser(session?.user || null);
          setLoading(false);
        }
      }
    );
    
    // Clean up the subscription on unmount
    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // Login with email and password
  const login = async ({ email, password }) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Login error:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register with email and password
  const register = async ({ email, password, name }) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });
      
      if (error) throw error;
      
      // If successful and not requiring email confirmation
      if (data?.user && !data?.user?.identities?.[0]?.identity_data?.email_confirmed_at) {
        // Store metadata into profile table if needed
        // This approach depends on your specific DB schema
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: data.user.id,
                full_name: name,
                email: email,
              },
            ]);
            
          if (profileError) throw profileError;
        } catch (profileError) {
          console.error('Error creating profile:', profileError.message);
        }
      }
      
      return data;
    } catch (error) {
      console.error('Registration error:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'lume://reset-password',
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Forgot password error:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (newPassword) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Reset password error:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Make the provider value available
  const value = {
    user,
    session,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
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