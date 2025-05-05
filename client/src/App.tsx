import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/context/UserContext";
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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <Toaster />
          <Router />
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
