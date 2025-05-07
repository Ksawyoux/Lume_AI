import { Redirect, Route } from "wouter";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { Loader2 } from "lucide-react";

interface SupabaseProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export default function SupabaseProtectedRoute({
  path,
  component: Component
}: SupabaseProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useSupabaseAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!isAuthenticated) {
    return (
      <Route path={path}>
        <Redirect to="/supabase-auth" />
      </Route>
    );
  }

  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}