import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/context/UserContext";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import Home from "@/pages/Home";
import Insights from "@/pages/Insights";
import Emotions from "@/pages/Emotions";
import Profile from "@/pages/Profile";
import AddTransaction from "@/pages/AddTransaction";
import Health from "@/pages/Health";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Home} />
      <ProtectedRoute path="/insights" component={Insights} />
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
        <UserProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
