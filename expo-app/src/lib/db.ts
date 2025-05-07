import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../models/schema';

// For React Native, we will need to connect to our API server
// rather than directly to the database
// This is because we can't securely store database credentials in a mobile app

// Base API URL 
export const API_URL = 'http://localhost:5000/api';

// Setup React Query fetcher
export const fetcher = async <T>({ url, method, body }: { url: string, method?: string, body?: any }): Promise<T> => {
  const response = await fetch(`${API_URL}${url}`, {
    method: method || 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Network response was not ok');
  }

  return response.json();
};