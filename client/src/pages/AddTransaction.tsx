import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { EmotionType, Emotion, emotionConfig, categoryIcons } from '@/types';
import EmojiSelector from '@/components/EmojiSelector';

export default function AddTransaction() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>("content");
  
  // Fetch the latest emotion to suggest it for the transaction
  const { data: latestEmotion } = useQuery<Emotion>({
    queryKey: user ? [`/api/users/${user.id}/emotions/latest`] : [],
    enabled: !!user,
    onSuccess: (data) => {
      if (data?.type && !selectedEmotion) {
        setSelectedEmotion(data.type as EmotionType);
      }
    }
  });
  
  const mutation = useMutation({
    mutationFn: async (data: {
      userId: number;
      amount: number;
      description: string;
      category: string;
      notes?: string;
      emotionId?: number;
    }) => {
      const res = await apiRequest('POST', '/api/transactions', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Transaction added",
        description: "Your transaction has been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/transactions`] });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Error adding transaction",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });
  
  const emotionMutation = useMutation({
    mutationFn: async (data: { userId: number; type: EmotionType; notes: string }) => {
      const res = await apiRequest('POST', '/api/emotions', data);
      return res.json();
    },
  });
  
  const handleSaveTransaction = async () => {
    if (!user || !amount || !description || !category) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    const amountValue = parseFloat(amount);
    
    if (isNaN(amountValue)) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid number for the amount.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // First create or get emotion
      let emotionId = latestEmotion?.id;
      
      // If user selected different emotion than latest one or there's no latest emotion
      if (selectedEmotion && (!latestEmotion || latestEmotion.type !== selectedEmotion)) {
        const newEmotion = await emotionMutation.mutateAsync({
          userId: user.id,
          type: selectedEmotion,
          notes: notes,
        });
        emotionId = newEmotion.id;
      }
      
      // Then create transaction with emotion reference
      await mutation.mutateAsync({
        userId: user.id,
        amount: amountValue,
        description,
        category,
        notes,
        emotionId,
      });
    } catch (error) {
      console.error("Error creating transaction:", error);
    }
  };
  
  const categoryOptions = [
    { value: "grocery", label: "Groceries" },
    { value: "restaurant", label: "Restaurant" },
    { value: "entertainment", label: "Entertainment" },
    { value: "shopping", label: "Shopping" },
    { value: "transport", label: "Transportation" },
    { value: "housing", label: "Housing" },
    { value: "utilities", label: "Utilities" },
    { value: "health", label: "Health" },
    { value: "education", label: "Education" },
    { value: "income", label: "Income" },
    { value: "other", label: "Other" },
  ];
  
  if (!user) return null;
  
  return (
    <div className="max-w-md mx-auto bg-[#f9fafb] min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 overflow-y-auto pb-16">
        <section className="px-4 pt-6 pb-4">
          <h2 className="text-xl font-semibold text-neutral-800">Add Transaction</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Record your financial activities with emotional context
          </p>
        </section>
        
        <section className="px-4 py-2">
          <Card className="border border-neutral-200">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Amount
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-neutral-500">$</span>
                    </div>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="pl-7"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div className="mt-1 flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-500 border-red-200 hover:bg-red-50"
                      onClick={() => setAmount(amount.startsWith('-') ? amount.substring(1) : `-${amount}`)}
                    >
                      Expense
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 text-green-500 border-green-200 hover:bg-green-50"
                      onClick={() => setAmount(amount.startsWith('-') ? amount.substring(1) : amount)}
                    >
                      Income
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Description
                  </label>
                  <Input
                    placeholder="What was this transaction for?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Category
                  </label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center">
                            <i className={`fas fa-${categoryIcons[option.value]} mr-2 text-neutral-500`}></i>
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    How are you feeling?
                  </label>
                  <EmojiSelector
                    selectedEmotion={selectedEmotion}
                    onSelect={setSelectedEmotion}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Notes (optional)
                  </label>
                  <Textarea
                    placeholder="Add any additional context about this transaction"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <Button
                  onClick={handleSaveTransaction}
                  disabled={!amount || !description || !category || mutation.isPending}
                  className="w-full"
                >
                  {mutation.isPending ? "Saving..." : "Save Transaction"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}
