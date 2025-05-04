import { Link, useLocation } from "wouter";
import { Home, BarChart3, PlusCircle, HeartPulse, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNavigation() {
  const [location] = useLocation();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background shadow-md">
      <div className="max-w-md mx-auto grid grid-cols-5 relative py-3">
        <NavItem 
          href="/" 
          label="Home" 
          icon={<Home size={20} />} 
          isActive={location === "/"} 
        />
        
        <NavItem 
          href="/insights" 
          label="Analytics" 
          icon={<BarChart3 size={20} />} 
          isActive={location === "/insights"} 
        />
        
        {/* Action Button - WHOOP-inspired center button */}
        <div className="flex flex-col items-center">
          <Link href="/add-transaction">
            <div className="action-button -mt-8 border-4 border-background">
              <PlusCircle size={24} />
            </div>
          </Link>
          <span className="text-xs mt-2 text-muted-foreground font-medium">Add</span>
        </div>
        
        <NavItem 
          href="/emotions" 
          label="Moods" 
          icon={<HeartPulse size={20} />} 
          isActive={location === "/emotions"} 
        />
        
        <NavItem 
          href="/profile" 
          label="You" 
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
          "w-8 h-8 flex items-center justify-center",
          isActive ? "text-primary" : "text-muted-foreground"
        )}>
          {icon}
        </div>
        <span className={cn(
          "text-xs mt-1 font-medium",
          isActive ? "text-primary" : "text-muted-foreground"
        )}>{label}</span>
      </div>
    </Link>
  );
}
