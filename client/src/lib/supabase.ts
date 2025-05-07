import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with the database
// Using hardcoded values from environment variables
const supabaseUrl = 'https://rjcirrjwekqlqeztoono.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqY2lycmp3ZWtxbHFlenRvb25vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MjkwMjYsImV4cCI6MjA2MjIwNTAyNn0.c0L0AkiT02Pip6S9fsigSjmhRZMcL0ZlRANPk6ZorxA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication helpers
export async function signUp(email: string, password: string, metadata?: any) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
  
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

// Set up auth state change listener
export function setupAuthListener(callback: (session: any) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session);
  });
}