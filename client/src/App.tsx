import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/context/UserContext";
import { AuthProvider } from "@/hooks/use-auth";
import { SupabaseAuthProvider } from "@/context/SupabaseAuthContext";
import { ProtectedRoute } from "@/lib/protected-route";
import SupabaseProtectedRoute from "@/components/SupabaseProtectedRoute";
import Home from "@/pages/Home";
import Insights from "@/pages/Insights";
import Emotions from "@/pages/Emotions";
import Profile from "@/pages/Profile";
import AddTransaction from "@/pages/AddTransaction";
import Health from "@/pages/Health";
import AuthPage from "@/pages/auth-page";
import SupabaseAuthPage from "@/pages/SupabaseAuthPage";
import NotFound from "@/pages/not-found";

// Original session-based authentication router
function LegacyRouter() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Home} />
      <ProtectedRoute path="/insights" component={Insights} />
      <ProtectedRoute path="/emotions" component={Emotions} />
      <ProtectedRoute path="/profile" component={Profile} />
      <ProtectedRoute path="/add-transaction" component={AddTransaction} />
      <ProtectedRoute path="/health" component={Health} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/supabase-auth" component={SupabaseAuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Supabase-based authentication router
function SupabaseRouter() {
  return (
    <Switch>
      <SupabaseProtectedRoute path="/supabase" component={Home} />
      <SupabaseProtectedRoute path="/supabase/insights" component={Insights} />
      <SupabaseProtectedRoute path="/supabase/emotions" component={Emotions} />
      <SupabaseProtectedRoute path="/supabase/profile" component={Profile} />
      <SupabaseProtectedRoute path="/supabase/add-transaction" component={AddTransaction} />
      <SupabaseProtectedRoute path="/supabase/health" component={Health} />
      <Route path="/supabase-auth" component={SupabaseAuthPage} />
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
          <SupabaseAuthProvider>
            <AuthProvider>
              <Toaster />
              {/* We're keeping both authentication systems, 
                  you can use either the legacy session-based auth or the new Supabase auth.
                  Original routes are available through / 
                  Supabase routes are available through /supabase */}
              <Switch>
                <Route path="/supabase/*">
                  <SupabaseRouter />
                </Route>
                <Route path="*">
                  <LegacyRouter />
                </Route>
              </Switch>
            </AuthProvider>
          </SupabaseAuthProvider>
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
