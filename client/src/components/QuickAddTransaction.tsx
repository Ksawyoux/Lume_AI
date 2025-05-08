import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmotionType, Emotion, emotionConfig } from '@/types';
import EmojiSelector from '@/components/EmojiSelector';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/context/UserContext';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Minus, DollarSign } from 'lucide-react';

export default function QuickAddTransaction() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  
  // Form state
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>("content");
  const [notes, setNotes] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');

  // Get the latest emotion to suggest
  const { data: latestEmotion } = useQuery<Emotion>({
    queryKey: user ? [`/api/users/${user.id}/emotions/latest`] : [],
    enabled: !!user
  });

  // Initialize with the latest emotion if available
  useState(() => {
    if (latestEmotion?.type) {
      setSelectedEmotion(latestEmotion.type as EmotionType);
    }
  });
  
  // Transaction mutation
  const transactionMutation = useMutation({
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
      return await apiRequest('POST', 'api/transactions', data);
    },
    onSuccess: () => {
      toast({
        title: "Transaction added",
        description: "Your transaction and mood have been recorded.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/transactions`] });
      // Clear form and close dialog
      resetForm();
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error adding transaction",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });
  
  // Emotion mutation
  const emotionMutation = useMutation({
    mutationFn: async (data: { userId: number; type: EmotionType; notes: string }) => {
      // Fixed parameter order: url, method, data
      return await apiRequest('api/emotions', 'POST', data);
    },
  });

  // Handle form submission
  const handleSubmit = async () => {
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
      // First create emotion
      let emotionId;
      
      if (selectedEmotion) {
        const newEmotion = await emotionMutation.mutateAsync({
          userId: user.id,
          type: selectedEmotion,
          notes: notes,
        });
        emotionId = newEmotion.id;
      }
      
      // Then create transaction with emotion reference
      await transactionMutation.mutateAsync({
        userId: user.id,
        amount: amountValue,
        description,
        category,
        notes,
        emotionId,
        date: new Date(),
        currency: currency
      });
      
      // Invalidate insights after transaction
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/insights`] });
    } catch (error) {
      console.error("Error creating transaction:", error);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setAmount('');
    setDescription('');
    setCategory('');
    setNotes('');
    setSelectedEmotion('content');
    setCurrency('USD');
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="fixed z-10 bottom-20 right-4 rounded-full h-14 w-14 shadow-lg bg-[#00f19f] hover:bg-[#00d88a] flex items-center justify-center">
          <Plus size={24} color="black" strokeWidth={3} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground uppercase tracking-wider">
            Quick Add
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {/* Currency Selection */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={`border-border ${currency === 'USD' ? 'bg-[hsl(var(--primary)/0.1)] text-primary border-primary' : 'bg-card text-foreground'}`}
              onClick={() => setCurrency('USD')}
            >
              USD ($)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={`border-border ${currency === 'MAD' ? 'bg-[hsl(var(--primary)/0.1)] text-primary border-primary' : 'bg-card text-foreground'}`}
              onClick={() => setCurrency('MAD')}
            >
              MAD (د.م.)
            </Button>
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
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Mood Selection */}
          <div>
            <label className="block text-sm font-semibold text-foreground uppercase tracking-wider mb-2">
              HOW ARE YOU FEELING?
            </label>
            <EmojiSelector
              selectedEmotion={selectedEmotion}
              onSelect={setSelectedEmotion}
            />
          </div>
          
          {/* Add Button */}
          <Button
            onClick={handleSubmit}
            disabled={!amount || !description || !category || transactionMutation.isPending}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-5 mt-4 uppercase tracking-wider font-semibold"
          >
            {transactionMutation.isPending ? "SAVING..." : "SAVE TRANSACTION & MOOD"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}