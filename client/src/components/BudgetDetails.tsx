import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Transaction, Budget } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/context/UserContext";
import { format } from "date-fns";
import { CheckCircle2, XCircle } from "lucide-react";

interface BudgetDetailsProps {
  budget: Budget;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BudgetDetails({ budget, open, onOpenChange }: BudgetDetailsProps) {
  const { user } = useUser();

  // Fetch transactions related to this budget
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: user ? [`/api/users/${user.id}/transactions`] : [],
    enabled: !!user && open,
  });

  // Fetch budget spending data
  const { data: budgetSpending } = useQuery<{ spent: number, remaining: number, percentage: number }>({
    queryKey: user ? [`/api/users/${user.id}/budgets/${budget.id}/spending`] : [],
    enabled: !!user && open,
  });

  // Format currency with the budget's currency
  const formatCurrency = (amount: number) => {
    switch (budget.currency) {
      case 'MAD':
        return `${amount.toFixed(2)} MAD`;
      case 'EUR':
        return `€${amount.toFixed(2)}`;
      case 'USD':
      default:
        return `$${amount.toFixed(2)}`;
    }
  };

  // Check if budget is on track
  const isOnTrack = budgetSpending && budgetSpending.percentage < 75;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#1a2126] text-white border-[#2A363D]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#00f19f]"></div>
            <DialogTitle className="text-xl">{budget.type.charAt(0).toUpperCase() + budget.type.slice(1)} Budget</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="py-2">
          {/* Budget Summary */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="text-lg font-semibold">{formatCurrency(budgetSpending?.spent || 0)} of {formatCurrency(budget.amount)}</div>
              <div className="text-lg font-semibold">{budgetSpending?.percentage || 0}%</div>
            </div>
            
            {/* Progress bar */}
            <div className="h-2 w-full bg-[#2A363D] rounded-full overflow-hidden mb-3">
              <div 
                className="h-full"
                style={{ 
                  width: `${budgetSpending?.percentage || 0}%`,
                  backgroundColor: (budgetSpending?.percentage || 0) > 90 ? '#FB5607' : 
                                   (budgetSpending?.percentage || 0) > 75 ? '#EEB868' : '#00f19f' 
                }}
              ></div>
            </div>
            
            {/* Remaining amount and status */}
            <div className="flex justify-between items-center">
              <div className="text-gray-400">Remaining: {formatCurrency(budgetSpending?.remaining || budget.amount)}</div>
              {isOnTrack ? (
                <div className="flex items-center text-[#00f19f]">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  <span>On track</span>
                </div>
              ) : (
                <div className="flex items-center text-[#FB5607]">
                  <XCircle className="h-4 w-4 mr-1" />
                  <span>Overspending</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Transaction List */}
          <div>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider">Recent Transactions</h3>
            
            {isLoading ? (
              <div className="text-center py-4 text-gray-400">Loading transactions...</div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {transactions.map(transaction => (
                  <div key={transaction.id} className="p-3 bg-[#222a32] rounded-lg border border-[#2A363D]">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-xs text-gray-400">
                          {format(new Date(transaction.date), 'MMM d, yyyy')} • {transaction.category}
                        </div>
                      </div>
                      <div className={`font-semibold ${transaction.amount < 0 ? 'text-[#FB5607]' : 'text-[#00f19f]'}`}>
                        {transaction.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400">No transactions found for this budget period</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}