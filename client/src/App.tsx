import { Switch, Route, useLocation } from "wouter";
import React, { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/context/UserContext";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Home from "@/pages/Home";
import Analytics from "@/pages/Insights";
import Emotions from "@/pages/Emotions";
import Profile from "@/pages/Profile";
import AddTransaction from "@/pages/AddTransaction";
import Health from "@/pages/Health";
import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/not-found";

function Router({ initialPath = "/" }: { initialPath?: string }) {
  // Use the Location hook from wouter to set the initial path
  const [, setLocation] = useLocation();

  // On mount, navigate to the initial path
  useEffect(() => {
    setLocation(initialPath);
  }, [initialPath, setLocation]);

  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={Home} />
      <ProtectedRoute path="/insights" component={Analytics} />
      <ProtectedRoute path="/emotions" component={Emotions} />
      <ProtectedRoute path="/profile" component={Profile} />
      <ProtectedRoute path="/add-transaction" component={AddTransaction} />
      <ProtectedRoute path="/health" component={Health} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [initializing, setInitializing] = useState(true);
  const [initialPath, setInitialPath] = useState("/auth");

  // On first load, check if user data exists in localStorage
  useEffect(() => {
    const localUser = localStorage.getItem('lumeUser');
    // If no local user exists, redirect to auth page
    if (!localUser) {
      window.history.replaceState(null, "", "/auth");
      setInitialPath("/auth");
    } else {
      // If local user exists, continue to requested page or default to home
      const path = window.location.pathname === "/auth" ? "/" : window.location.pathname;
      setInitialPath(path);
    }
    setInitializing(false);
  }, []);

  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <UserProvider>
            <Toaster />
            <Router initialPath={initialPath} />
          </UserProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;