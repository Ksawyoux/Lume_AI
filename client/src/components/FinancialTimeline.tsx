import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, differenceInDays, subMonths } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Award, 
  Star,
  Zap,
  Lightbulb 
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface Transaction {
  id: number;
  amount: number;
  description: string;
  category: string;
  date: string;
  emotionId: number | null;
  currency: string;
  emotion?: {
    id: number;
    type: string;
    notes: string | null;
    date: string;
  } | null;
}

interface TimelineItem {
  id: number;
  date: Date;
  type: 'transaction' | 'milestone';
  data: any;
  position: 'left' | 'right';
}

interface Milestone {
  id: number;
  title: string;
  description: string;
  date: Date;
  type: 'achievement' | 'insight' | 'goal';
  icon: 'award' | 'lightbulb' | 'star' | 'zap'; 
}

const defaultMilestones: Milestone[] = [
  {
    id: 1001,
    title: "First Budget Created",
    description: "You set up your first budget. Great step toward financial wellness!",
    date: new Date(new Date().setDate(new Date().getDate() - 25)),
    type: 'achievement',
    icon: 'award'
  },
  {
    id: 1002,
    title: "Mood-Spending Insight",
    description: "We noticed you spend 30% less when you're in a 'content' mood!",
    date: new Date(new Date().setDate(new Date().getDate() - 15)),
    type: 'insight',
    icon: 'lightbulb'
  },
  {
    id: 1003,
    title: "Weekly Streak",
    description: "You've tracked your emotions for 7 days in a row!",
    date: new Date(new Date().setDate(new Date().getDate() - 7)),
    type: 'achievement',
    icon: 'zap'
  },
  {
    id: 1004,
    title: "Saving Goal",
    description: "Set a goal to save 15% of your income each month",
    date: new Date(new Date().setDate(new Date().getDate() - 5)),
    type: 'goal',
    icon: 'star'
  }
];

export default function FinancialTimeline() {
  const { user } = useUser();
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'transactions' | 'milestones'>('all');
  const [timelineRange, setTimelineRange] = useState<'1m' | '3m' | '6m' | '1y'>('1m');

  // Fetch transactions
  const { 
    data: transactions, 
    isLoading: isLoadingTransactions,
    isError: isTransactionsError
  } = useQuery<Transaction[]>({
    queryKey: user ? [`/api/users/${user?.id}/transactions`] : [],
    enabled: !!user,
  });

  // Process transactions and milestones into timeline items
  useEffect(() => {
    if (!transactions) return;

    // Get date range based on selected filter
    const getDateRange = () => {
      const today = new Date();
      switch (timelineRange) {
        case '3m': return subMonths(today, 3);
        case '6m': return subMonths(today, 6);
        case '1y': return subMonths(today, 12);
        default: return subMonths(today, 1); // 1m default
      }
    };
    
    const startDate = getDateRange();
    
    // Filter transactions by date range
    const filteredTransactions = transactions.filter(t => 
      new Date(t.date) >= startDate
    );
    
    // Filter milestones by date range
    const filteredMilestones = defaultMilestones.filter(m => 
      m.date >= startDate
    );
    
    // Create timeline items
    let items: TimelineItem[] = [];
    
    // Add transactions if filter allows
    if (timelineFilter === 'all' || timelineFilter === 'transactions') {
      items = [
        ...items,
        ...filteredTransactions.map((t, index) => ({
          id: t.id,
          date: new Date(t.date),
          type: 'transaction' as const,
          data: t,
          position: index % 2 === 0 ? 'left' as const : 'right' as const
        }))
      ];
    }
    
    // Add milestones if filter allows
    if (timelineFilter === 'all' || timelineFilter === 'milestones') {
      items = [
        ...items,
        ...filteredMilestones.map((m, index) => ({
          id: m.id,
          date: m.date,
          type: 'milestone' as const,
          data: m,
          position: index % 2 === 0 ? 'right' as const : 'left' as const
        }))
      ];
    }
    
    // Sort all items by date (newest first)
    items.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    // Alternate positions to prevent clustering
    const alternatedItems = items.map((item, index) => ({
      ...item,
      position: index % 2 === 0 ? 'left' as const : 'right' as const
    }));
    
    setTimelineItems(alternatedItems);
  }, [transactions, timelineFilter, timelineRange]);

  // Render transaction item
  const renderTransactionItem = (transaction: Transaction) => {
    const amount = transaction.amount;
    const isExpense = amount < 0;
    
    return (
      <div className="mb-1">
        <div className="flex items-center mb-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
            isExpense ? 'bg-red-500/20' : 'bg-green-500/20'
          }`}>
            {isExpense ? (
              <TrendingDown size={16} className="text-red-500" />
            ) : (
              <TrendingUp size={16} className="text-green-500" />
            )}
          </div>
          <div className="font-semibold text-white">{transaction.description}</div>
        </div>
        <div className="text-xs text-gray-400 mb-1">{transaction.category}</div>
        <div className={`text-lg font-bold ${isExpense ? 'text-red-500' : 'text-green-500'}`}>
          {isExpense ? '-' : '+'}{Math.round(Math.abs(amount))} MAD
        </div>
        {transaction.emotion && (
          <div className="text-xs mt-1 flex items-center">
            <div className={`w-2 h-2 rounded-full mr-1 ${
              transaction.emotion.type === 'happy' ? 'bg-green-500' :
              transaction.emotion.type === 'content' ? 'bg-[#00f19f]' :
              transaction.emotion.type === 'neutral' ? 'bg-blue-400' :
              transaction.emotion.type === 'worried' ? 'bg-yellow-400' :
              'bg-red-500'
            }`}></div>
            <span className="text-gray-400">
              {transaction.emotion.type.charAt(0).toUpperCase() + transaction.emotion.type.slice(1)} mood
            </span>
          </div>
        )}
      </div>
    );
  };

  // Render milestone item
  const renderMilestoneItem = (milestone: Milestone) => {
    return (
      <div className="mb-1">
        <div className="flex items-center mb-1">
          <div className="w-8 h-8 rounded-full bg-[#00f19f]/20 flex items-center justify-center mr-2">
            {milestone.icon === 'award' && <Award size={16} className="text-[#00f19f]" />}
            {milestone.icon === 'lightbulb' && <Lightbulb size={16} className="text-[#00f19f]" />}
            {milestone.icon === 'star' && <Star size={16} className="text-[#00f19f]" />}
            {milestone.icon === 'zap' && <Zap size={16} className="text-[#00f19f]" />}
          </div>
          <div className="font-semibold text-white">{milestone.title}</div>
        </div>
        <div className="text-xs text-gray-400 mb-1">
          {milestone.type.charAt(0).toUpperCase() + milestone.type.slice(1)}
        </div>
        <div className="text-sm text-white">{milestone.description}</div>
      </div>
    );
  };

  // Get icon by milestone type
  const getMilestoneIcon = (type: string, iconName: string) => {
    if (iconName === 'award') return <Award size={16} className="text-white" />;
    if (iconName === 'lightbulb') return <Lightbulb size={16} className="text-white" />;
    if (iconName === 'star') return <Star size={16} className="text-white" />;
    if (iconName === 'zap') return <Zap size={16} className="text-white" />;
    return <Award size={16} className="text-white" />;
  };

  if (isLoadingTransactions) {
    return (
      <div className="space-y-4 mt-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isTransactionsError) {
    return (
      <div className="p-4 bg-red-500/10 text-red-400 rounded-md">
        Error loading your financial journey data. Please try again.
      </div>
    );
  }

  return (
    <div className="relative pt-1">
      {/* Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-2">
          <Button 
            variant={timelineFilter === 'all' ? 'default' : 'outline'} 
            onClick={() => setTimelineFilter('all')}
            className={`px-3 py-1 h-8 text-sm ${timelineFilter === 'all' ? 'bg-[#00f19f] text-black' : 'bg-transparent border-gray-700'}`}
          >
            All
          </Button>
          <Button 
            variant={timelineFilter === 'transactions' ? 'default' : 'outline'} 
            onClick={() => setTimelineFilter('transactions')}
            className={`px-3 py-1 h-8 text-sm ${timelineFilter === 'transactions' ? 'bg-[#00f19f] text-black' : 'bg-transparent border-gray-700'}`}
          >
            Transactions
          </Button>
          <Button 
            variant={timelineFilter === 'milestones' ? 'default' : 'outline'} 
            onClick={() => setTimelineFilter('milestones')}
            className={`px-3 py-1 h-8 text-sm ${timelineFilter === 'milestones' ? 'bg-[#00f19f] text-black' : 'bg-transparent border-gray-700'}`}
          >
            Milestones
          </Button>
        </div>
        <div className="flex space-x-1">
          <Button 
            variant={timelineRange === '1m' ? 'default' : 'outline'} 
            onClick={() => setTimelineRange('1m')}
            className={`px-2 h-8 text-xs ${timelineRange === '1m' ? 'bg-[#00f19f] text-black' : 'bg-transparent border-gray-700'}`}
          >
            1M
          </Button>
          <Button 
            variant={timelineRange === '3m' ? 'default' : 'outline'} 
            onClick={() => setTimelineRange('3m')}
            className={`px-2 h-8 text-xs ${timelineRange === '3m' ? 'bg-[#00f19f] text-black' : 'bg-transparent border-gray-700'}`}
          >
            3M
          </Button>
          <Button 
            variant={timelineRange === '6m' ? 'default' : 'outline'} 
            onClick={() => setTimelineRange('6m')}
            className={`px-2 h-8 text-xs ${timelineRange === '6m' ? 'bg-[#00f19f] text-black' : 'bg-transparent border-gray-700'}`}
          >
            6M
          </Button>
        </div>
      </div>
      
      {/* Timeline */}
      <div className="relative">
        {/* Center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-700 -ml-0.5"></div>
        
        {timelineItems.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Calendar className="mx-auto h-12 w-12 text-gray-700 mb-3" />
            <p>No entries found in this time period.</p>
            <p className="text-sm">Try selecting a different time range.</p>
          </div>
        ) : (
          <div className="relative">
            {timelineItems.map((item, index) => {
              const isTransaction = item.type === 'transaction';
              const isMilestone = item.type === 'milestone';
              const isLeft = item.position === 'left';
              
              // Set date display format
              let dateDisplay = format(item.date, 'MMM d, yyyy');
              const daysAgo = differenceInDays(new Date(), item.date);
              if (daysAgo === 0) dateDisplay = 'Today';
              else if (daysAgo === 1) dateDisplay = 'Yesterday';
              else if (daysAgo < 7) dateDisplay = `${daysAgo} days ago`;
              
              return (
                <motion.div
                  key={`${item.type}-${item.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`flex items-center mb-6 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  {/* Content */}
                  <div className={`w-5/12 ${isLeft ? 'text-right pr-4' : 'text-left pl-4'}`}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-[#252a2e] p-3 rounded-lg inline-block cursor-pointer"
                      onClick={() => setSelectedItem(item)}
                    >
                      {isTransaction && renderTransactionItem(item.data)}
                      {isMilestone && renderMilestoneItem(item.data)}
                      <div className="text-xs text-gray-500 mt-2">{dateDisplay}</div>
                    </motion.div>
                  </div>
                  
                  {/* Center point */}
                  <div className="z-10">
                    <motion.div 
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isTransaction 
                          ? 'border-blue-400 bg-[#1c2127]' 
                          : 'border-[#00f19f] bg-[#1c2127]'
                      }`}
                      whileHover={{ scale: 1.5 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedItem(item)}
                    >
                      {isMilestone && (
                        <div className="w-2 h-2 rounded-full bg-[#00f19f]"></div>
                      )}
                      {isTransaction && (
                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      )}
                    </motion.div>
                  </div>
                  
                  {/* Empty space for the other side */}
                  <div className="w-5/12"></div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Selected item detail modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-0 left-0 right-0 bg-[#1a1d21] rounded-t-xl p-5 pb-8 shadow-xl z-50 max-h-[80vh] overflow-auto"
            style={{ zIndex: 1000 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                {selectedItem.type === 'transaction' ? 'Transaction Details' : 'Milestone Details'}
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-white"
              >
                Close
              </Button>
            </div>
            
            {selectedItem.type === 'transaction' && (
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#252a2e] p-3 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">AMOUNT</p>
                    <p className={`text-xl font-bold ${selectedItem.data.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {selectedItem.data.amount < 0 ? '-' : '+'}{Math.round(Math.abs(selectedItem.data.amount))} MAD
                    </p>
                  </div>
                  <div className="bg-[#252a2e] p-3 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">CATEGORY</p>
                    <p className="text-xl font-bold text-white">{selectedItem.data.category}</p>
                  </div>
                </div>
                
                <div className="mt-4 bg-[#252a2e] p-3 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">DESCRIPTION</p>
                  <p className="text-white">{selectedItem.data.description}</p>
                </div>
                
                <div className="mt-4 bg-[#252a2e] p-3 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">DATE & TIME</p>
                  <p className="text-white">{format(new Date(selectedItem.data.date), 'MMMM d, yyyy - h:mm a')}</p>
                </div>
                
                {selectedItem.data.emotion && (
                  <div className="mt-4 bg-[#252a2e] p-3 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">EMOTIONAL STATE</p>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        selectedItem.data.emotion.type === 'happy' ? 'bg-green-500' :
                        selectedItem.data.emotion.type === 'content' ? 'bg-[#00f19f]' :
                        selectedItem.data.emotion.type === 'neutral' ? 'bg-blue-400' :
                        selectedItem.data.emotion.type === 'worried' ? 'bg-yellow-400' :
                        'bg-red-500'
                      }`}></div>
                      <p className="text-white capitalize">{selectedItem.data.emotion.type}</p>
                    </div>
                    {selectedItem.data.emotion.notes && (
                      <p className="text-gray-400 text-sm mt-1">{selectedItem.data.emotion.notes}</p>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {selectedItem.type === 'milestone' && (
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#00f19f]/20 flex items-center justify-center mr-3">
                    {getMilestoneIcon(selectedItem.data.type, selectedItem.data.icon)}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{selectedItem.data.title}</h4>
                    <p className="text-sm text-gray-400 capitalize">{selectedItem.data.type}</p>
                  </div>
                </div>
                
                <div className="bg-[#252a2e] p-4 rounded-lg mt-3">
                  <p className="text-white">{selectedItem.data.description}</p>
                </div>
                
                <div className="mt-4 bg-[#252a2e] p-3 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">DATE ACHIEVED</p>
                  <p className="text-white">{format(selectedItem.data.date, 'MMMM d, yyyy')}</p>
                </div>
                
                {selectedItem.data.type === 'goal' && (
                  <Button className="w-full mt-4 bg-[#00f19f] text-black hover:bg-[#00d88a]">
                    View Goal Details
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}