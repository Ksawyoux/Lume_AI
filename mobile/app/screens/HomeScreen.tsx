import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Import custom components (you'll need to create these later)
import RecentTransactions from '../components/RecentTransactions';
import EmotionTracker from '../components/EmotionTracker';

// Types
type EmotionType = 'stressed' | 'worried' | 'neutral' | 'content' | 'happy';

const emotionConfig: Record<EmotionType, {
  label: string;
  color: string;
  icon: string;
  backgroundColor: string;
}> = {
  stressed: {
    label: 'Stressed',
    color: '#FF5252',
    icon: 'emoticon-frown',
    backgroundColor: 'rgba(255, 82, 82, 0.2)'
  },
  worried: {
    label: 'Worried',
    color: '#FF9800',
    icon: 'emoticon-confused',
    backgroundColor: 'rgba(255, 152, 0, 0.2)'
  },
  neutral: {
    label: 'Neutral',
    color: '#64B5F6',
    icon: 'emoticon-neutral',
    backgroundColor: 'rgba(100, 181, 246, 0.2)'
  },
  content: {
    label: 'Content',
    color: '#4CAF50',
    icon: 'emoticon-happy',
    backgroundColor: 'rgba(76, 175, 80, 0.2)'
  },
  happy: {
    label: 'Happy',
    color: '#00f19f',
    icon: 'emoticon-excited',
    backgroundColor: 'rgba(0, 241, 159, 0.2)'
  }
};

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [latestEmotion, setLatestEmotion] = useState<EmotionType | null>('content');
  const [balance, setBalance] = useState(5892.46);
  
  // Placeholder data
  const mockFinancialHealth = {
    score: 78,
    change: +2,
    status: 'Good',
  };
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    
    // Simulate a network request
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00f19f" />
      }
    >
      {/* Balance Card */}
      <LinearGradient
        colors={['#2A363D', '#1A2125']}
        style={styles.balanceCard}
      >
        <View style={styles.balanceHeaderRow}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <View style={styles.emotionPill}>
            {latestEmotion && (
              <>
                <MaterialCommunityIcons 
                  name={emotionConfig[latestEmotion].icon as any} 
                  size={16} 
                  color={emotionConfig[latestEmotion].color} 
                />
                <Text style={[styles.emotionText, { color: emotionConfig[latestEmotion].color }]}>
                  {emotionConfig[latestEmotion].label}
                </Text>
              </>
            )}
          </View>
        </View>
        <Text style={styles.balanceAmount}>${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        
        <View style={styles.balanceActions}>
          <TouchableOpacity style={styles.balanceAction}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="arrow-down" size={18} color="#00f19f" />
            </View>
            <Text style={styles.actionText}>Deposit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.balanceAction}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="arrow-up" size={18} color="#00f19f" />
            </View>
            <Text style={styles.actionText}>Withdraw</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.balanceAction}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="swap-horizontal" size={18} color="#00f19f" />
            </View>
            <Text style={styles.actionText}>Transfer</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
      
      {/* Financial Health and Recovery Score */}
      <View style={styles.metricsRow}>
        {/* Financial Health */}
        <LinearGradient
          colors={['#2A363D', '#1A2125']}
          style={[styles.metricCard, styles.financialHealthCard]}
        >
          <View style={styles.metricHeader}>
            <Ionicons name="wallet-outline" size={20} color="#00f19f" />
            <Text style={styles.metricTitle}>Financial Health</Text>
          </View>
          <View style={styles.metricContent}>
            <Text style={styles.metricValue}>{mockFinancialHealth.score}%</Text>
            <View style={styles.metricChangeRow}>
              <Ionicons 
                name={mockFinancialHealth.change >= 0 ? "arrow-up" : "arrow-down"} 
                size={14} 
                color={mockFinancialHealth.change >= 0 ? "#00f19f" : "#FF5252"} 
              />
              <Text style={[
                styles.metricChange, 
                { color: mockFinancialHealth.change >= 0 ? "#00f19f" : "#FF5252" }
              ]}>
                {Math.abs(mockFinancialHealth.change)}%
              </Text>
            </View>
            <Text style={styles.metricStatus}>{mockFinancialHealth.status}</Text>
          </View>
        </LinearGradient>
        
        {/* Recovery Score */}
        <LinearGradient
          colors={['#2A363D', '#1A2125']}
          style={[styles.metricCard, styles.recoveryScoreCard]}
        >
          <View style={styles.metricHeader}>
            <Ionicons name="fitness-outline" size={20} color="#00f19f" />
            <Text style={styles.metricTitle}>Recovery</Text>
          </View>
          <View style={styles.metricContent}>
            <Text style={styles.metricValue}>87%</Text>
            <View style={styles.metricChangeRow}>
              <Ionicons name="arrow-up" size={14} color="#00f19f" />
              <Text style={styles.metricChange}>15%</Text>
            </View>
            <Text style={styles.metricStatus}>Excellent</Text>
          </View>
        </LinearGradient>
      </View>
      
      {/* Emotion Tracker */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>How are you feeling?</Text>
        </View>
        <EmotionTracker />
      </View>
      
      {/* Recent Transactions */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <RecentTransactions />
      </View>
      
      {/* Recommended Actions */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended Actions</Text>
        </View>
        <LinearGradient
          colors={['rgba(0, 241, 159, 0.2)', 'rgba(0, 241, 159, 0.05)']}
          style={styles.recommendationCard}
        >
          <View style={styles.recommendationIcon}>
            <Ionicons name="leaf-outline" size={24} color="#00f19f" />
          </View>
          <View style={styles.recommendationContent}>
            <Text style={styles.recommendationTitle}>
              You're in a positive state. Good time to review your investment portfolio.
            </Text>
            <Text style={styles.recommendationDescription}>
              Research shows that people make better financial decisions when in a positive emotional state.
            </Text>
          </View>
        </LinearGradient>
      </View>
      
      {/* Empty space at bottom for navigation safety */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  balanceCard: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#D0D0D0',
  },
  emotionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(42, 42, 42, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  emotionText: {
    fontSize: 12,
    marginLeft: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  balanceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceAction: {
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 241, 159, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#D0D0D0',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  metricCard: {
    borderRadius: 16,
    padding: 12,
    width: '48%',
  },
  financialHealthCard: {
    // Additional styling for financial health card if needed
  },
  recoveryScoreCard: {
    // Additional styling for recovery score card if needed
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    color: '#D0D0D0',
    marginLeft: 6,
  },
  metricContent: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  metricChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metricChange: {
    fontSize: 12,
    color: '#00f19f',
    marginLeft: 2,
  },
  metricStatus: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  seeAllText: {
    fontSize: 14,
    color: '#00f19f',
  },
  recommendationCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 241, 159, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 12,
    color: '#D0D0D0',
  },
});