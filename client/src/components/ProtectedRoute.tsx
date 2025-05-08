import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType;
};

// Separate component to handle the conditional rendering
function RouteContent({ Component }: { Component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return <Component />;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  return (
    <Route path={path}>
      {() => <RouteContent Component={Component} />}
    </Route>
  );
}