import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { Plus, Wallet, ChevronRight, Circle, AlertCircle, TrendingUp, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Switch } from '@/components/ui/switch';

interface Budget {
  id: number;
  userId: number;
  type: string;
  amount: number;
  category: string | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  currency: string;
}

interface BudgetSpending {
  spent: number;
  remaining: number;
  percentage: number;
}

const budgetFormSchema = z.object({
  type: z.string(),
  amount: z.coerce.number().positive('Budget amount must be positive'),
  category: z.string().nullable().transform((val) => val === "all" ? null : val),
  startDate: z.string(),
  endDate: z.string().nullable(),
  isActive: z.boolean(),
  currency: z.string().default('MAD')
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

interface BudgetManagerProps {
  onError?: (error: string) => void;
}

export default function BudgetManager({ onError }: BudgetManagerProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Propagate errors to parent component if needed
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // Get active budgets for the user
  const { 
    data: budgets, 
    isLoading: isLoadingBudgets,
    error: budgetsError
  } = useQuery<Budget[]>({
    queryKey: user ? [`/api/users/${user.id}/budgets/active`] : [],
    queryFn: async () => {
      if (!user) return [];
      const response = await fetch(`/api/users/${user.id}/budgets/active`);
      if (!response.ok) {
        throw new Error('Failed to fetch budgets');
      }
      return response.json();
    },
    enabled: !!user,
  });
  
  // Handle errors from budgets query
  useEffect(() => {
    if (budgetsError) {
      const errorMessage = budgetsError?.message || 'Failed to fetch budgets. Please try again.';
      setError(errorMessage);
      console.error('Error fetching budgets:', budgetsError);
    }
  }, [budgetsError]);
  
  // Create budget form
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      type: 'monthly',
      amount: 0,
      category: null,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: null,
      isActive: true,
      currency: 'MAD'
    },
  });

  // Mutation to create a new budget
  const createBudgetMutation = useMutation({
    mutationFn: async (data: BudgetFormValues) => {
      if (!user) return null;
      
      try {
        // Send the form data directly (the server will handle string-to-date conversion)
        // Fixed parameter order: path, method, data
        return await apiRequest("/budgets", "POST", {
          userId: user.id,
          ...data
        });
      } catch (err: any) {
        const errorMessage = err?.message || 'Failed to create budget. Please try again.';
        setError(errorMessage);
        throw err;
      }
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/budgets/active`] });
      }
      toast({
        title: "Budget created",
        description: "Your budget has been created successfully.",
      });
      setIsAddDialogOpen(false);
      form.reset();
      // Clear any previous errors
      setError(null);
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to create budget. Please try again later.";
      setError(errorMessage);
      toast({
        title: "Error creating budget",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Budget creation error:', error);
    },
  });

  // Handler for form submission
  const onSubmit = (data: BudgetFormValues) => {
    createBudgetMutation.mutate(data);
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold">Budgets</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0 rounded-full bg-[#00f19f] hover:bg-[#00d88a]"
            >
              <Plus className="h-4 w-4 text-black" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1c2127] text-white border-gray-800">
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
              <DialogDescription className="text-gray-400">
                Set up a new budget to track your spending by category or time period.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-[#252a2e] border-gray-700">
                            <SelectValue placeholder="Select budget type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#252a2e] border-gray-700">
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          {...field} 
                          className="bg-[#252a2e] border-gray-700"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category (Optional)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-[#252a2e] border-gray-700">
                            <SelectValue placeholder="All categories" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#252a2e] border-gray-700">
                          <SelectItem value="all">All categories</SelectItem>
                          <SelectItem value="grocery">Grocery</SelectItem>
                          <SelectItem value="entertainment">Entertainment</SelectItem>
                          <SelectItem value="shopping">Shopping</SelectItem>
                          <SelectItem value="dining">Dining</SelectItem>
                          <SelectItem value="transportation">Transportation</SelectItem>
                          <SelectItem value="utilities">Utilities</SelectItem>
                          <SelectItem value="health">Health</SelectItem>
                          <SelectItem value="housing">Housing</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-[#252a2e] border-gray-700">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#252a2e] border-gray-700">
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="MAD">MAD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          className="bg-[#252a2e] border-gray-700"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-700 p-3 bg-[#252a2e]">
                      <div className="space-y-0.5">
                        <FormLabel>Active Budget</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="mt-4">
                  <Button type="submit" className="bg-[#00f19f] text-black hover:bg-[#00d88a]">
                    Create Budget
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 mb-4 bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-2">Error Loading Budgets</h3>
          <p className="text-sm text-gray-300">{error}</p>
          <div className="flex mt-2 space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs border-gray-700 hover:bg-gray-800"
              onClick={() => {
                setError(null);
                if (user) {
                  window.location.reload();
                }
              }}
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {isLoadingBudgets ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : budgets && budgets.length > 0 ? (
        <div className="space-y-3">
          {budgets.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} />
          ))}
        </div>
      ) : (
        <div className="bg-[#252a2e] rounded-lg p-4 flex flex-col items-center text-center">
          <Wallet className="h-10 w-10 mb-2 text-gray-500" />
          <h4 className="text-md font-medium mb-1">No budgets yet</h4>
          <p className="text-sm text-gray-400 mb-3">
            Create a budget to track your spending and stay on target.
          </p>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-[#00f19f] text-black hover:bg-[#00d88a] rounded-full px-4"
          >
            Create Budget
          </Button>
        </div>
      )}
    </div>
  );
}

// Budget Card component for displaying a single budget
function BudgetCard({ budget, onDelete }: { budget: Budget, onDelete?: (id: number) => void }) {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [spendingError, setSpendingError] = useState<string | null>(null);
  
  // Delete budget mutation
  const deleteMutation = useMutation({
    mutationFn: async (budgetId: number) => {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete budget: ${response.statusText}`);
      }
      
      return true;
    },
    onSuccess: () => {
      // Invalidate budget queries to refresh the list
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/budgets/active`] });
      toast({
        title: "Budget deleted",
        description: "The budget has been removed successfully",
      });
      if (onDelete) onDelete(budget.id);
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting budget",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Get budget spending data
  const { 
    data: spending, 
    isLoading: isLoadingSpending,
    error: spendingQueryError
  } = useQuery<BudgetSpending>({
    queryKey: user ? [`/api/users/${user.id}/budgets/${budget.id}/spending`] : [],
    queryFn: user ? async () => {
      const response = await fetch(`/api/users/${user.id}/budgets/${budget.id}/spending`);
      if (!response.ok) {
        throw new Error(`Failed to fetch budget spending: ${response.statusText}`);
      }
      return response.json();
    } : undefined,
    enabled: !!user,
  });
  
  // Handle errors from budget spending query
  useEffect(() => {
    if (spendingQueryError) {
      const errorMessage = spendingQueryError?.message || 'Failed to fetch budget spending data';
      setSpendingError(errorMessage);
      console.error(`Error fetching spending for budget ${budget.id}:`, spendingQueryError);
    }
  }, [spendingQueryError, budget.id]);
  
  // Format currency based on the budget settings
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
  
  // Get display name for budget type
  const getBudgetTypeName = (type: string) => {
    switch (type) {
      case 'monthly':
        return 'Monthly Budget';
      case 'yearly':
        return 'Yearly Budget';
      case 'custom':
        return 'Custom Budget';
      default:
        return 'Budget';
    }
  };
  
  // Get status based on spending percentage
  const getStatus = (percentage: number) => {
    if (percentage >= 90) {
      return { color: 'text-red-500', icon: <AlertCircle className="h-4 w-4" />, text: 'Critical' };
    } else if (percentage >= 75) {
      return { color: 'text-yellow-500', icon: <TrendingUp className="h-4 w-4" />, text: 'Warning' };
    } else {
      return { color: 'text-green-500', icon: <Check className="h-4 w-4" />, text: 'On track' };
    }
  };
  
  return (
    <div className="bg-[#252a2e] rounded-lg p-4 relative">
      {showDeleteConfirm ? (
        <div className="absolute inset-0 bg-[#252a2e] rounded-lg p-4 flex flex-col items-center justify-center z-10">
          <p className="text-sm text-center mb-4">Are you sure you want to delete this budget?</p>
          <div className="flex space-x-3">
            <Button 
              variant="destructive" 
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(budget.id)}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}
      
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <Circle className="h-3 w-3 mr-2 text-[#00f19f]" fill="#00f19f" />
          <h4 className="text-md font-medium">{getBudgetTypeName(budget.type)}</h4>
        </div>
        <div className="flex items-center">
          <Button 
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </Button>
          <ChevronRight className="h-4 w-4 text-gray-500 ml-1" />
        </div>
      </div>
      
      {budget.category && (
        <p className="text-xs text-gray-400 mb-2">
          Category: {budget.category.charAt(0).toUpperCase() + budget.category.slice(1)}
        </p>
      )}
      
      {isLoadingSpending ? (
        <Skeleton className="h-6 w-full mb-2" />
      ) : spendingError ? (
        <div className="text-xs text-red-400 border border-red-500/30 rounded-md p-2 my-1">
          <p>Error loading spending data</p>
          <button 
            className="text-blue-400 hover:underline mt-1 text-xs"
            onClick={() => setSpendingError(null)}
          >
            Try again
          </button>
        </div>
      ) : spending ? (
        <>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-300">
              {formatCurrency(spending.spent)} of {formatCurrency(budget.amount)}
            </span>
            <span className="text-sm text-gray-300">
              {spending.percentage.toFixed(0)}%
            </span>
          </div>
          
          <Progress 
            value={spending.percentage} 
            className={`h-2 mb-2 ${spending.percentage >= 90 ? "[&>div]:bg-red-500" : spending.percentage >= 75 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-[#00f19f]"}`}
          />
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">
              Remaining: {formatCurrency(spending.remaining)}
            </span>
            
            {spending && (
              <div className={`flex items-center text-xs ${getStatus(spending.percentage).color}`}>
                {getStatus(spending.percentage).icon}
                <span className="ml-1">{getStatus(spending.percentage).text}</span>
              </div>
            )}
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-400">Budget data not available</p>
      )}
    </div>
  );
}