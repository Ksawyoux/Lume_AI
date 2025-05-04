import { Link, useLocation } from "wouter";
import { Home, PieChart, PlusCircle, Smile, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNavigation() {
  const [location] = useLocation();
  
  return (
    <div className="border-t border-neutral-200 bg-white">
      <div className="grid grid-cols-5 py-3">
        <Link href="/">
          <a className="flex flex-col items-center">
            <div className={cn(
              "w-6 h-6 flex items-center justify-center",
              location === "/" ? "text-primary" : "text-neutral-400"
            )}>
              <Home size={20} />
            </div>
            <span className="text-xs mt-1 text-neutral-500">Home</span>
          </a>
        </Link>
        
        <Link href="/insights">
          <a className="flex flex-col items-center">
            <div className={cn(
              "w-6 h-6 flex items-center justify-center",
              location === "/insights" ? "text-primary" : "text-neutral-400"
            )}>
              <PieChart size={20} />
            </div>
            <span className="text-xs mt-1 text-neutral-500">Insights</span>
          </a>
        </Link>
        
        <Link href="/add-transaction">
          <a className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center -mt-5 shadow-lg">
              <PlusCircle size={24} />
            </div>
            <span className="text-xs mt-1 text-neutral-500">Add</span>
          </a>
        </Link>
        
        <Link href="/emotions">
          <a className="flex flex-col items-center">
            <div className={cn(
              "w-6 h-6 flex items-center justify-center",
              location === "/emotions" ? "text-primary" : "text-neutral-400"
            )}>
              <Smile size={20} />
            </div>
            <span className="text-xs mt-1 text-neutral-500">Emotions</span>
          </a>
        </Link>
        
        <Link href="/profile">
          <a className="flex flex-col items-center">
            <div className={cn(
              "w-6 h-6 flex items-center justify-center",
              location === "/profile" ? "text-primary" : "text-neutral-400"
            )}>
              <User size={20} />
            </div>
            <span className="text-xs mt-1 text-neutral-500">Profile</span>
          </a>
        </Link>
      </div>
    </div>
  );
}
