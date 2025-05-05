import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/context/UserContext";
import WelcomeScreen from "@/components/WelcomeScreen";
import Home from "@/pages/Home";
import Insights from "@/pages/Insights";
import Emotions from "@/pages/Emotions";
import Profile from "@/pages/Profile";
import AddTransaction from "@/pages/AddTransaction";
import Health from "@/pages/Health";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/insights" component={Insights} />
      <Route path="/emotions" component={Emotions} />
      <Route path="/profile" component={Profile} />
      <Route path="/add-transaction" component={AddTransaction} />
      <Route path="/health" component={Health} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // State to control whether to show the welcome screen
  const [showWelcome, setShowWelcome] = useState(false);
  
  useEffect(() => {
    // Always show the welcome screen for demo purposes
    // In production, you would use the commented code below
    setShowWelcome(true);
    
    // Check if this is the first visit
    // const hasVisitedBefore = localStorage.getItem('lume_has_visited');
    // if (!hasVisitedBefore) {
    //   setShowWelcome(true);
    // }
  }, []);
  
  const handleWelcomeComplete = () => {
    // Save that user has completed onboarding
    localStorage.setItem('lume_has_visited', 'true');
    setShowWelcome(false);
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <Toaster />
          {showWelcome ? (
            <WelcomeScreen onComplete={handleWelcomeComplete} />
          ) : (
            <Router />
          )}
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
