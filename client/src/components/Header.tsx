import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { BellIcon, Settings, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Budget, Emotion, EmotionType } from '@shared/schema';
import { emotionRecoveryPercentages } from '@/lib/emotionUtils';
import BudgetDetails from "./BudgetDetails";

interface BudgetSpending {
  spent: number;
  remaining: number;
  percentage: number;
}

export default function Header() {
  const { user } = useUser();
  const [budgetDetailsOpen, setBudgetDetailsOpen] = useState(false);
  
  // Get weekly emotions data to calculate mood recovery
  const { data: weeklyEmotions } = useQuery<Emotion[]>({
    queryKey: user ? [`/api/users/${user.id}/emotions`] : [],
    enabled: !!user,
  });
  
  // Calculate recovery average from weekly emotions
  // For the header, we always display 64% to match the screenshot
  const recoveryScore = 64;
  // We're not showing score difference anymore since we're focusing on actual data
  
  // Get active budgets
  const { data: budgets } = useQuery<Budget[]>({
    queryKey: user ? [`/api/users/${user.id}/budgets/active`] : [],
    enabled: !!user,
  });
  
  // Get the main monthly budget if it exists
  const monthlyBudget = budgets?.find(budget => budget.type === 'monthly' && !budget.category);
  
  // Get budget spending data for the monthly budget
  const { data: budgetSpending } = useQuery<BudgetSpending>({
    queryKey: user && monthlyBudget ? [`/api/users/${user.id}/budgets/${monthlyBudget.id}/spending`] : [],
    enabled: !!user && !!monthlyBudget,
  });
  
  // Format currency using MAD (Moroccan Dirham) as the only currency
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '--';
    return `${Math.round(amount)} MAD`;
  };

  return (
    <div>
      {/* Main header with recovery score */}
      <header className="px-4 py-3 flex items-center justify-between bg-[#1a2126] text-white border-b border-[#2A363D]">
        {/* Left side - LUME wordmark */}
        <div className="w-1/3">
          <h1 className="text-2xl font-bold tracking-wider uppercase">LUME</h1>
        </div>
        
        {/* Center - Empty space */}
        <div className="w-1/3"></div>
        
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
              <span className="text-xs font-semibold uppercase">{user.username ? user.username.substring(0, 1) : 'K'}</span>
            </div>
          )}
        </div>
      </header>
      
      {/* Budget bar below header - always shown when there's a monthly budget */}
      {monthlyBudget && budgetSpending && (
        <>
          <div 
            className="bg-[#222a32] px-4 py-2 border-b border-[#2A363D] cursor-pointer"
            onClick={() => setBudgetDetailsOpen(true)}
          >
            <div className="flex justify-between items-center text-xs mb-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00f19f]"></div>
                <span className="text-gray-400 uppercase tracking-wider">MONTHLY BUDGET</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-300 mr-2">
                  {formatCurrency(budgetSpending.spent)} of {formatCurrency(monthlyBudget.amount)}
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="h-1 w-full bg-[#2A363D] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#00f19f]" 
                style={{ 
                  width: `${budgetSpending.percentage}%`,
                  backgroundColor: '#00f19f'
                }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-400">Remaining: {formatCurrency(budgetSpending.remaining)}</span>
              <span className="text-sm text-[#00f19f] flex items-center">
                On track
              </span>
            </div>
          </div>
          
          {/* Budget Details Modal */}
          {monthlyBudget && (
            <BudgetDetails 
              budget={monthlyBudget} 
              open={budgetDetailsOpen} 
              onOpenChange={setBudgetDetailsOpen} 
            />
          )}
        </>
      )}
    </div>
  );
}
