import { Link, useLocation } from "wouter";
import { Home, BarChart3, HeartPulse, User, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNavigation() {
  const [location] = useLocation();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background shadow-md">
      <div className="max-w-md mx-auto grid grid-cols-5 relative py-3">
        <NavItem 
          href="/" 
          label="HOME" 
          icon={<Home size={20} />} 
          isActive={location === "/"} 
        />
        
        <NavItem 
          href="/insights" 
          label="ANALYTICS" 
          icon={<BarChart3 size={20} />} 
          isActive={location === "/insights"} 
        />
        
        <NavItem 
          href="/health" 
          label="HEALTH" 
          icon={<Activity size={20} />} 
          isActive={location === "/health"} 
        />
        
        <NavItem 
          href="/emotions" 
          label="MOOD" 
          icon={<HeartPulse size={20} />} 
          isActive={location === "/emotions"} 
        />
        
        <NavItem 
          href="/profile" 
          label="YOU" 
          icon={<User size={20} />} 
          isActive={location === "/profile"} 
        />
      </div>
    </div>
  );
}

type NavItemProps = {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
};

function NavItem({ href, label, icon, isActive }: NavItemProps) {
  return (
    <Link href={href}>
      <div className="flex flex-col items-center cursor-pointer">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200",
          isActive 
            ? "text-primary bg-primary/10 border border-primary/20" 
            : "text-muted-foreground hover:bg-muted/50"
        )}>
          {icon}
        </div>
        <span className={cn(
          "text-xs mt-1 font-medium uppercase tracking-widest transition-colors duration-200",
          isActive ? "text-primary" : "text-muted-foreground"
        )}>{label}</span>
      </div>
    </Link>
  );
}
