import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<{ user: User }, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<{ user: User }, Error, RegisterData>;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  password: string;
  name: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  const {
    data,
    error,
    isLoading,
    refetch: refetchUser
  } = useQuery({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/user");
        if (!response.ok) {
          if (response.status === 401) {
            // If we're not on the auth page, redirect to it
            if (window.location.pathname !== "/auth") {
              window.location.href = "/auth";
            }
            return { user: null };
          }
          throw new Error("Failed to fetch user");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching user:", error);
        return { user: null };
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Check localStorage for stored user data as well
  const localUser = localStorage.getItem('lumeUser');
  const parsedLocalUser = localUser ? JSON.parse(localUser) : null;
  
  // Use API data if available, otherwise fall back to localStorage
  const user = data?.user || parsedLocalUser;

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to login");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], data);
      // Store user data in localStorage
      localStorage.setItem('lumeUser', JSON.stringify(data.user));
      // Redirect to home
      window.location.href = "/";
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.name}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to register");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], data);
      // Store user data in localStorage
      localStorage.setItem('lumeUser', JSON.stringify(data.user));
      // Redirect to home
      window.location.href = "/";
      toast({
        title: "Registration successful",
        description: `Welcome to Lume, ${data.user.name}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/logout", {
        method: "POST",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to logout");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      // Clear user data from localStorage
      localStorage.removeItem('lumeUser');
      // Redirect to auth page
      window.location.href = "/auth";
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error: error as Error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}