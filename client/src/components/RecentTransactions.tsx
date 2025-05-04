import { formatDistanceToNow } from 'date-fns';
import { useUser } from '@/context/UserContext';
import { Transaction, emotionConfig, categoryIcons } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';

export default function RecentTransactions() {
  const { user } = useUser();
  
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: user ? [`/api/users/${user.id}/transactions?limit=4`] : [],
    enabled: !!user,
  });
  
  if (!user) return null;
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      signDisplay: 'exceptZero',
    }).format(amount);
  };
  
  const formatTransactionDate = (date: string | Date) => {
    const transactionDate = new Date(date);
    return formatDistanceToNow(transactionDate, { addSuffix: true });
  };
  
  const formatTransactionTime = (date: string | Date) => {
    const transactionDate = new Date(date);
    return transactionDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };
  
  const getCategoryIcon = (category: string) => {
    return categoryIcons[category] || 'tag';
  };
  
  return (
    <section className="px-4 py-2">
      {/* WHOOP-inspired section header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-medium text-foreground">Transactions</h3>
        <Link href="/insights">
          <a className="text-sm text-primary font-medium hover:text-primary/80 transition-colors">
            View all
          </a>
        </Link>
      </div>
      
      {/* WHOOP-inspired transaction list */}
      <div className="whoop-container">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 border-b border-border last:border-0">
                <div className="flex items-center">
                  <Skeleton className="w-10 h-10 rounded-full mr-3" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <div>
                        <Skeleton className="h-4 w-16 mb-2" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {transactions?.map((transaction, index) => {
              const isPositive = transaction.amount > 0;
              const emotionType = transaction.emotion?.type as keyof typeof emotionConfig;
              const isLast = index === transactions.length - 1;
              
              return (
                <div 
                  key={transaction.id} 
                  className={`p-3 hover:bg-accent/10 transition-colors ${!isLast ? 'border-b border-border' : ''}`}
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${isPositive ? 'finance-positive bg-[hsl(var(--finance-positive)/0.1)]' : 'finance-negative bg-[hsl(var(--finance-negative)/0.1)]'}`}>
                      <i className={`fas fa-${getCategoryIcon(transaction.category)}`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-medium text-foreground">{transaction.description}</h4>
                          <p className="text-xs text-muted-foreground">
                            {formatTransactionDate(transaction.date)}, {formatTransactionTime(transaction.date)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`text-sm font-medium ${isPositive ? 'finance-positive' : 'finance-negative'}`}>
                            {formatAmount(transaction.amount)}
                          </span>
                          
                          {emotionType && (
                            <span className={`text-xs mt-1 inline-flex items-center px-2 py-0.5 rounded-full ${emotionConfig[emotionType].cssClass}`}>
                              <i className={`fas fa-${emotionConfig[emotionType].icon} mr-1 text-xs`}></i>
                              {emotionConfig[emotionType].label}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
