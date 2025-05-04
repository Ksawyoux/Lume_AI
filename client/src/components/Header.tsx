import { useUser } from "@/context/UserContext";
import { BellIcon, MoonIcon } from "lucide-react";

export default function Header() {
  const { user } = useUser();
  
  return (
    <header className="px-4 py-4 flex items-center justify-between border-b border-border bg-card">
      <div className="flex items-center">
        <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-sm">
          <MoonIcon className="h-5 w-5" />
        </div>
        <h1 className="ml-3 text-xl font-semibold text-foreground">Lume</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-muted-foreground hover:text-foreground transition-colors relative">
          <BellIcon className="h-5 w-5" />
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500"></span>
        </button>
        {user && (
          <div className="w-9 h-9 bg-accent text-primary rounded-full flex items-center justify-center shadow-sm border border-border">
            <span className="text-sm font-medium">{user.initials}</span>
          </div>
        )}
      </div>
    </header>
  );
}
