import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Create a fallback localStorage implementation for environments
// where AsyncStorage is not available (web)
const customStorage = {
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

// Validate Supabase credentials
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.'
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});