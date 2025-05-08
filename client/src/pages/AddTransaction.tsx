import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Minus, RefreshCw } from 'lucide-react';

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
  const [date, setDate] = useState<Date>(new Date());
  const [currency, setCurrency] = useState<string>('USD'); // Default to USD
  
  // Fetch the latest emotion to suggest it for the transaction
  const { data: latestEmotion } = useQuery<Emotion>({
    queryKey: user ? [`/api/users/${user.id}/emotions/latest`] : [],
    enabled: !!user
  });

  // Set selected emotion when latest emotion is loaded
  useEffect(() => {
    if (latestEmotion?.type && !selectedEmotion) {
      setSelectedEmotion(latestEmotion.type as EmotionType);
    }
  }, [latestEmotion, selectedEmotion]);
  
  const mutation = useMutation({
    mutationFn: async (data: {
      userId: number;
      amount: number;
      description: string;
      category: string;
      notes?: string;
      emotionId?: number;
      date?: Date;
      currency: string;
    }) => {
      const res = await apiRequest('POST', 'api/transactions', data);
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
      const res = await apiRequest('POST', 'api/emotions', data);
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
      let emotionId;
      if (latestEmotion) {
        emotionId = latestEmotion.id;
      }
      
      // If user selected different emotion than latest one or there's no latest emotion
      if (selectedEmotion && (!latestEmotion || latestEmotion.type !== selectedEmotion)) {
        const newEmotion = await emotionMutation.mutateAsync({
          userId: user.id,
          type: selectedEmotion,
          notes: notes,
        });
        emotionId = newEmotion.id;
      }
      
      // Then create transaction with emotion reference and currency
      await mutation.mutateAsync({
        userId: user.id,
        amount: amountValue,
        description,
        category,
        notes,
        emotionId,
        date: date,
        currency: currency
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
    <div className="max-w-md mx-auto bg-background min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 overflow-y-auto pb-16">
        <section className="px-4 pt-6 pb-4">
          <h2 className="text-xl font-semibold text-foreground uppercase tracking-wider">ADD TRANSACTION</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Record financial activities with emotional context
          </p>
        </section>
        
        <section className="px-4 py-2">
          <div className="whoop-container mb-4">
            <div className="space-y-4">
              {/* Date picker */}
              <div>
                <label className="block text-sm font-semibold text-foreground uppercase tracking-wider mb-2">
                  DATE
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-border bg-card hover:bg-accent text-foreground"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Currency selection */}
              <div>
                <label className="block text-sm font-semibold text-foreground uppercase tracking-wider mb-2">
                  CURRENCY
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`border-border ${currency === 'USD' ? 'bg-[hsl(var(--primary)/0.1)] text-primary border-primary' : 'bg-card text-foreground'} flex items-center justify-center`}
                    onClick={() => setCurrency('USD')}
                  >
                    USD ($)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`border-border ${currency === 'MAD' ? 'bg-[hsl(var(--primary)/0.1)] text-primary border-primary' : 'bg-card text-foreground'} flex items-center justify-center`}
                    onClick={() => setCurrency('MAD')}
                  >
                    MAD (د.م.)
                  </Button>
                </div>
              </div>
              
              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-foreground uppercase tracking-wider mb-2">
                  AMOUNT
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-muted-foreground">{currency === 'USD' ? '$' : 'د.م.'}</span>
                  </div>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="pl-10 bg-card border-border text-foreground"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`border-border ${amount.startsWith('-') ? 'bg-[hsl(var(--recovery-low)/0.1)] text-[hsl(var(--recovery-low))] border-[hsl(var(--recovery-low))]' : 'bg-card text-foreground'} flex items-center justify-center`}
                    onClick={() => setAmount(amount.startsWith('-') ? amount.substring(1) : `-${amount}`)}
                  >
                    <Minus size={14} className="mr-1" />
                    EXPENSE
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`border-border ${!amount.startsWith('-') && amount !== '' ? 'bg-[hsl(var(--recovery-high)/0.1)] text-[hsl(var(--recovery-high))] border-[hsl(var(--recovery-high))]' : 'bg-card text-foreground'} flex items-center justify-center`}
                    onClick={() => setAmount(amount.startsWith('-') ? amount.substring(1) : amount)}
                  >
                    <Plus size={14} className="mr-1" />
                    INCOME
                  </Button>
                </div>
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-foreground uppercase tracking-wider mb-2">
                  DESCRIPTION
                </label>
                <Input
                  placeholder="What was this transaction for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-card border-border text-foreground"
                />
              </div>
              
              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-foreground uppercase tracking-wider mb-2">
                  CATEGORY
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-card border-border text-foreground">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <i className={`fas fa-${categoryIcons[option.value]} mr-2 text-muted-foreground`}></i>
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Emotion Selector */}
              <div>
                <label className="block text-sm font-semibold text-foreground uppercase tracking-wider mb-2">
                  HOW ARE YOU FEELING?
                </label>
                <EmojiSelector
                  selectedEmotion={selectedEmotion}
                  onSelect={setSelectedEmotion}
                />
              </div>
              
              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-foreground uppercase tracking-wider mb-2">
                  NOTES (OPTIONAL)
                </label>
                <Textarea
                  placeholder="Add any additional context about this transaction"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="bg-card border-border text-foreground resize-none"
                />
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <Button
            onClick={handleSaveTransaction}
            disabled={!amount || !description || !category || mutation.isPending}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 uppercase tracking-wider font-semibold"
          >
            {mutation.isPending ? "SAVING..." : "SAVE TRANSACTION"}
          </Button>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}
