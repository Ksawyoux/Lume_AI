import { useUser } from "@/context/UserContext";
import { BellIcon, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Budget, Emotion, EmotionType } from '@shared/schema';
import { emotionRecoveryPercentages } from '@/lib/emotionUtils';

interface BudgetSpending {
  spent: number;
  remaining: number;
  percentage: number;
}

export default function Header() {
  const { user } = useUser();
  
  // Get weekly emotions data to calculate mood recovery
  const { data: weeklyEmotions } = useQuery<Emotion[]>({
    queryKey: user ? [`/api/users/${user.id}/emotions`] : [],
    enabled: !!user,
  });
  
  // Calculate recovery average from weekly emotions
  const calculateRecoveryAverage = (): number => {
    if (!weeklyEmotions || weeklyEmotions.length === 0) return 0; // Show 0% if no data
    
    const moods = weeklyEmotions.map(emotion => emotion.type as EmotionType);
    const total = moods.reduce((sum, mood) => {
      return sum + emotionRecoveryPercentages[mood];
    }, 0);
    
    return Math.round(total / moods.length);
  };
  
  const recoveryScore = calculateRecoveryAverage();
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
  
  // Format currency
  const formatCurrency = (amount: number | undefined, currency: string = 'USD') => {
    if (amount === undefined) return '--';
    
    switch (currency) {
      case 'MAD':
        return `${amount.toFixed(0)} MAD`;
      case 'EUR':
        return `€${amount.toFixed(0)}`;
      case 'USD':
      default:
        return `$${amount.toFixed(0)}`;
    }
  };

  return (
    <div>
      {/* Main header with recovery score */}
      <header className="px-4 py-3 flex items-center justify-between bg-[#1a2126] text-white border-b border-[#2A363D]">
        {/* Left side - LUME wordmark */}
        <div className="w-1/3">
          <h1 className="text-2xl font-bold tracking-wider uppercase">LUME</h1>
        </div>
        
        {/* Center - WHOOP-style recovery score display as a badge - exact match for screenshot */}
        <div className="w-1/3 flex justify-center">
          <div className="flex flex-col items-center relative">
            {/* Arc background for recovery percentage */}
            <div className="w-14 h-14 relative flex items-center justify-center">
              {/* Semi-circle background track */}
              <div className="absolute w-full h-full rounded-full border-4 border-gray-700 opacity-30"></div>
              
              {/* Recovery arc - dynamic based on percentage */}
              <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="none" 
                  stroke="#00f19f" 
                  strokeWidth="8" 
                  strokeDasharray="251.2" 
                  strokeDashoffset={251.2 - (251.2 * recoveryScore / 100)}
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Percentage display */}
              <div className="z-10 text-center">
                <span className="text-xl font-bold text-[#00f19f]">
                  {recoveryScore}%
                </span>
              </div>
            </div>
            <span className="text-xs text-gray-400 uppercase tracking-wider mt-1">RECOVERY</span>
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
              <span className="text-xs font-semibold uppercase">{user.username ? user.username.substring(0, 1) : 'K'}</span>
            </div>
          )}
        </div>
      </header>
      
      {/* Budget bar below header - only show when there's actual spending data */}
      {monthlyBudget && budgetSpending && budgetSpending.spent > 0 && (
        <div className="bg-[#222a32] px-4 py-2 border-b border-[#2A363D]">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-gray-400 uppercase tracking-wider">MONTHLY BUDGET</span>
            <span className="text-gray-300">
              {formatCurrency(budgetSpending.spent, monthlyBudget.currency)} of {formatCurrency(monthlyBudget.amount, monthlyBudget.currency)}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1 w-full bg-[#2A363D] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#00f19f]" 
              style={{ 
                width: `${budgetSpending.percentage}%`,
                backgroundColor: budgetSpending.percentage > 90 ? '#FB5607' : 
                                budgetSpending.percentage > 75 ? '#EEB868' : '#00f19f'
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
