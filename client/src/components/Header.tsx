import { useUser } from "@/context/UserContext";
import { BellIcon, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Header() {
  const { user } = useUser();
  
  // WHOOP-style recovery score (67-100% is high recovery)
  const recoveryScore = 87;
  const scoreDiff = 15;
  const isScoreUp = scoreDiff > 0;
  
  // Get active budgets
  const { data: budgets } = useQuery({
    queryKey: user ? [`/api/users/${user.id}/budgets/active`] : [],
    enabled: !!user,
  });
  
  // Get the main monthly budget if it exists
  const monthlyBudget = budgets?.find(b => b.type === 'monthly' && !b.category);
  
  // Get budget spending data for the monthly budget
  const { data: budgetSpending } = useQuery({
    queryKey: user && monthlyBudget ? [`/api/users/${user.id}/budgets/${monthlyBudget.id}/spending`] : [],
    enabled: !!user && !!monthlyBudget,
  });
  
  return (
    <header className="px-4 py-3 flex items-center justify-between bg-[#1a2126] text-white border-b border-[#2A363D]">
      {/* Left side - LUME wordmark */}
      <div className="w-1/3">
        <h1 className="text-2xl font-bold tracking-wider uppercase">LUME</h1>
      </div>
      
      {/* Center - WHOOP-style recovery score display as a badge - exact match for screenshot */}
      <div className="w-1/3 flex justify-center">
        <div className="flex flex-col items-center">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-[#00f19f]">
              {recoveryScore}%
            </span>
            <span className="text-sm text-[#00f19f]">
              +{scoreDiff}
            </span>
          </div>
          <span className="text-xs text-gray-400 uppercase tracking-wider">RECOVERY</span>
        </div>
      </div>
      
      {/* Right side icons */}
      <div className="w-1/3 flex justify-end items-center space-x-4">
        <button className="text-gray-400 hover:text-white transition-colors relative">
          <BellIcon className="h-5 w-5" />
        </button>
        <button className="text-gray-400 hover:text-white transition-colors">
          <Settings className="h-5 w-5" />
        </button>
        {user && (
          <div className="w-7 h-7 bg-[#2A363D] text-white rounded-full flex items-center justify-center shadow-sm">
            <span className="text-xs font-semibold uppercase">YS</span>
          </div>
        )}
      </div>
    </header>
  );
}
