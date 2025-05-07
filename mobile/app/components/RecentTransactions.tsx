import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Types
type EmotionType = 'stressed' | 'worried' | 'neutral' | 'content' | 'happy';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  emotion?: EmotionType;
}

const emotionConfig: Record<EmotionType, {
  color: string;
  icon: string;
}> = {
  stressed: {
    color: '#FF5252',
    icon: 'emoticon-frown'
  },
  worried: {
    color: '#FF9800',
    icon: 'emoticon-confused'
  },
  neutral: {
    color: '#64B5F6',
    icon: 'emoticon-neutral'
  },
  content: {
    color: '#4CAF50',
    icon: 'emoticon-happy'
  },
  happy: {
    color: '#00f19f',
    icon: 'emoticon-excited'
  }
};

const categoryConfig: Record<string, {
  icon: string;
  color: string;
}> = {
  food: {
    icon: 'fast-food',
    color: '#FF9800'
  },
  shopping: {
    icon: 'cart',
    color: '#E91E63'
  },
  transportation: {
    icon: 'car',
    color: '#2196F3'
  },
  entertainment: {
    icon: 'film',
    color: '#9C27B0'
  },
  health: {
    icon: 'fitness',
    color: '#4CAF50'
  },
  housing: {
    icon: 'home',
    color: '#795548'
  },
  utilities: {
    icon: 'flash',
    color: '#FFC107'
  },
  other: {
    icon: 'ellipsis-horizontal',
    color: '#607D8B'
  }
};

// Sample data
const sampleTransactions: Transaction[] = [
  {
    id: '1',
    amount: -34.97,
    description: 'Whole Foods Market',
    category: 'food',
    date: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    emotion: 'content'
  },
  {
    id: '2',
    amount: -64.32,
    description: 'Amazon.com',
    category: 'shopping',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    emotion: 'stressed'
  },
  {
    id: '3',
    amount: -12.50,
    description: 'Uber Ride',
    category: 'transportation',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    emotion: 'neutral'
  },
  {
    id: '4',
    amount: 1250.00,
    description: 'Paycheck Deposit',
    category: 'income',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
  },
  {
    id: '5',
    amount: -45.99,
    description: 'Netflix Subscription',
    category: 'entertainment',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
    emotion: 'content'
  }
];

export default function RecentTransactions() {
  // Format amount
  const formatAmount = (amount: number) => {
    const prefix = amount >= 0 ? '+' : '';
    return `${prefix}$${Math.abs(amount).toFixed(2)}`;
  };
  
  // Format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return diffInHours === 0 ? 'Just now' : `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return diffInDays === 1 ? 'Yesterday' : `${diffInDays}d ago`;
    }
  };
  
  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity style={styles.transactionItem}>
      <View style={styles.transactionIconContainer}>
        <View style={[styles.categoryIcon, { backgroundColor: categoryConfig[item.category]?.color || '#607D8B' }]}>
          <Ionicons 
            name={(categoryConfig[item.category]?.icon as any) || 'ellipsis-horizontal'} 
            size={16} 
            color="#FFFFFF" 
          />
        </View>
        {item.emotion && (
          <View style={styles.emotionBadge}>
            <MaterialCommunityIcons 
              name={emotionConfig[item.emotion].icon as any} 
              size={12} 
              color={emotionConfig[item.emotion].color} 
            />
          </View>
        )}
      </View>
      
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
      </View>
      
      <Text style={[
        styles.transactionAmount, 
        item.amount >= 0 ? styles.positiveAmount : styles.negativeAmount
      ]}>
        {formatAmount(item.amount)}
      </Text>
    </TouchableOpacity>
  );
  
  return (
    <LinearGradient
      colors={['#2A363D', '#1A2125']}
      style={styles.container}
    >
      <FlatList
        data={sampleTransactions}
        renderItem={renderTransaction}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  transactionIconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#607D8B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emotionBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#121212',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positiveAmount: {
    color: '#00f19f',
  },
  negativeAmount: {
    color: '#FFFFFF',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});