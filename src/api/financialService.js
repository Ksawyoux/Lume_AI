// Simulated financial data service
// In a real application, this would connect to your backend API

// Get recent transactions
export const getRecentTransactions = async (userId, limit = 10) => {
  try {
    // In a real app, this would be a fetch call to your API endpoint
    // const response = await fetch(`/api/transactions?userId=${userId}&limit=${limit}`);
    // return await response.json();
    
    // Simulated response for demo purposes
    return [
      {
        id: 1,
        type: 'expense',
        amount: 52.38,
        category: 'food',
        description: 'Grocery shopping',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        emotionAtTime: 'content'
      },
      {
        id: 2,
        type: 'income',
        amount: 127.00,
        category: 'freelance',
        description: 'Client payment',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        emotionAtTime: 'happy'
      },
      {
        id: 3,
        type: 'expense',
        amount: 8.50,
        category: 'food',
        description: 'Coffee shop',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        emotionAtTime: 'neutral'
      },
      {
        id: 4,
        type: 'expense',
        amount: 35.99,
        category: 'entertainment',
        description: 'Streaming subscription',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        emotionAtTime: 'neutral'
      },
      {
        id: 5,
        type: 'expense',
        amount: 124.75,
        category: 'shopping',
        description: 'Online purchase',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        emotionAtTime: 'stressed'
      }
    ];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw new Error('Failed to fetch transactions');
  }
};

// Create a new transaction
export const createTransaction = async (transactionData) => {
  try {
    // In a real app, this would be a fetch call to your API endpoint
    // const response = await fetch('/api/transactions', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(transactionData)
    // });
    // return await response.json();
    
    // Simulated response for demo purposes
    return {
      ...transactionData,
      id: Date.now(),
      date: new Date(),
      status: 'success'
    };
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw new Error('Failed to create transaction');
  }
};

// Get spending by emotion
export const getSpendingByEmotion = async (userId, timeframe = 'month') => {
  try {
    // In a real app, this would be a fetch call to your API endpoint
    // const response = await fetch(`/api/spending/by-emotion?userId=${userId}&timeframe=${timeframe}`);
    // return await response.json();
    
    // Simulated response for demo purposes
    return [
      { emotion: 'happy', amount: 420, percentage: 28 },
      { emotion: 'content', amount: 350, percentage: 23 },
      { emotion: 'neutral', amount: 280, percentage: 19 },
      { emotion: 'worried', amount: 230, percentage: 15 },
      { emotion: 'stressed', amount: 220, percentage: 15 }
    ];
  } catch (error) {
    console.error('Error fetching spending by emotion:', error);
    throw new Error('Failed to fetch spending data');
  }
};

// Get spending categories
export const getSpendingCategories = async (userId, timeframe = 'month') => {
  try {
    // In a real app, this would be a fetch call to your API endpoint
    // const response = await fetch(`/api/spending/categories?userId=${userId}&timeframe=${timeframe}`);
    // return await response.json();
    
    // Simulated response for demo purposes
    return [
      { category: 'food', amount: 580, percentage: 35 },
      { category: 'bills', amount: 450, percentage: 27 },
      { category: 'entertainment', amount: 320, percentage: 19 },
      { category: 'shopping', amount: 180, percentage: 11 },
      { category: 'transport', amount: 130, percentage: 8 }
    ];
  } catch (error) {
    console.error('Error fetching spending categories:', error);
    throw new Error('Failed to fetch category data');
  }
};

// Get financial insights
export const getFinancialInsights = async (userId) => {
  try {
    // In a real app, this would be a fetch call to your API endpoint
    // const response = await fetch(`/api/insights/financial?userId=${userId}`);
    // return await response.json();
    
    // Simulated response for demo purposes
    return {
      monthlyIncome: 3200,
      monthlyExpenses: 2650,
      savingsRate: 0.17,
      spendingTrend: -0.05, // 5% decrease from last month
      topSpendingCategory: 'food',
      unusualSpending: {
        category: 'shopping',
        amount: 180,
        percentageChange: 0.25, // 25% increase
        emotionalCorrelation: 'stressed'
      },
      recommendations: [
        'Your spending increases by 35% when stressed. Consider implementing a 24-hour rule for purchases when feeling stressed.',
        'You save 28% more on days with high recovery scores. Try to make financial decisions when well-rested.',
        'Creating a dedicated budget for stress relief activities might help reduce impulse purchases.'
      ]
    };
  } catch (error) {
    console.error('Error fetching financial insights:', error);
    throw new Error('Failed to fetch insights');
  }
};