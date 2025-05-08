import { Switch, Route } from "wouter";
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

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Home} />
      <ProtectedRoute path="/insights" component={Analytics} />
      <ProtectedRoute path="/emotions" component={Emotions} />
      <ProtectedRoute path="/profile" component={Profile} />
      <ProtectedRoute path="/add-transaction" component={AddTransaction} />
      <ProtectedRoute path="/health" component={Health} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <UserProvider>
            <Toaster />
            <Router />
          </UserProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
