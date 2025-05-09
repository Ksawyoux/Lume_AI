import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart, LineChart } from 'react-native-chart-kit';

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

interface SpendingByEmotion {
  emotion: EmotionType;
  amount: number;
  percentage: number;
}

export default function InsightsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('analytics');
  
  // Sample data
  const [spendingByEmotion, setSpendingByEmotion] = useState<SpendingByEmotion[]>([
    { emotion: 'stressed', amount: 452.38, percentage: 35 },
    { emotion: 'worried', amount: 247.65, percentage: 20 },
    { emotion: 'neutral', amount: 187.55, percentage: 15 },
    { emotion: 'content', amount: 156.29, percentage: 12 },
    { emotion: 'happy', amount: 246.12, percentage: 18 },
  ]);
  
  const [emotionalTrends, setEmotionalTrends] = useState({
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [4, 3, 2, 3, 5, 4, 5],
        color: () => '#00f19f',
        strokeWidth: 2
      }
    ],
    legend: ["Mood Score (1-5)"]
  });
  
  const [personalizedInsights, setPersonalizedInsights] = useState([
    {
      id: '1',
      title: 'Emotional Spending Pattern',
      description: 'You tend to spend 35% more when stressed. Try setting spending limits for these times.',
      icon: 'trending-up',
      color: '#FF5252'
    },
    {
      id: '2',
      title: 'Financial Health Opportunity',
      description: 'Your recovery score is correlated with better financial decisions. 87% recovery today suggests good financial decision making.',
      icon: 'fitness',
      color: '#00f19f'
    },
    {
      id: '3',
      title: 'Saving Opportunity',
      description: 'You save 24% more when in a content or happy state. Consider setting up automated savings on days with high positive emotion scores.',
      icon: 'save',
      color: '#4CAF50'
    }
  ]);
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    
    // Simulate a network request
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  // Generate chart data for pie chart
  const getChartData = () => {
    return spendingByEmotion.map(item => ({
      name: emotionConfig[item.emotion].label,
      population: item.percentage,
      color: emotionConfig[item.emotion].color,
      legendFontColor: '#FFFFFF',
      legendFontSize: 12
    }));
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `${Math.round(amount)} MAD`;
  };
  
  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00f19f" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Insights</Text>
          <Text style={styles.headerSubtitle}>Financial behavior insights</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="bar-chart" size={20} color="#00f19f" />
        </View>
      </View>
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>
            Analytics
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'personalized' && styles.activeTab]}
          onPress={() => setActiveTab('personalized')}
        >
          <Text style={[styles.tabText, activeTab === 'personalized' && styles.activeTabText]}>
            Personalized
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Analytics Tab Content */}
      {activeTab === 'analytics' && (
        <View style={styles.tabContent}>
          {/* Spending by Emotion */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Spending by Emotion</Text>
            </View>
            
            <LinearGradient
              colors={['#2A363D', '#1A2125']}
              style={styles.chartCard}
            >
              <View style={styles.chartContainer}>
                <PieChart
                  data={getChartData()}
                  width={Dimensions.get('window').width - 64}
                  height={200}
                  chartConfig={{
                    backgroundGradientFrom: '#1E2923',
                    backgroundGradientTo: '#08130D',
                    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="0"
                  absolute
                />
              </View>
              
              {/* Legend */}
              <View style={styles.legendContainer}>
                {spendingByEmotion.map((item) => (
                  <View key={item.emotion} style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: emotionConfig[item.emotion].color }]} />
                    <View style={styles.legendTextContainer}>
                      <Text style={styles.legendLabel}>{emotionConfig[item.emotion].label}</Text>
                      <Text style={styles.legendValue}>{formatCurrency(item.amount)}</Text>
                    </View>
                    <Text style={styles.legendPercentage}>{item.percentage}%</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </View>
          
          {/* Emotional Trends */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Emotional Trends</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Monthly</Text>
              </TouchableOpacity>
            </View>
            
            <LinearGradient
              colors={['#2A363D', '#1A2125']}
              style={styles.chartCard}
            >
              <LineChart
                data={emotionalTrends}
                width={Dimensions.get('window').width - 64}
                height={200}
                chartConfig={{
                  backgroundColor: 'transparent',
                  backgroundGradientFrom: 'transparent',
                  backgroundGradientTo: 'transparent',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(0, 241, 159, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: '#00f19f'
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
            </LinearGradient>
          </View>
          
          {/* Spending Suggestions */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Spending Suggestions</Text>
            </View>
            
            <LinearGradient
              colors={['rgba(0, 241, 159, 0.2)', 'rgba(0, 241, 159, 0.05)']}
              style={styles.suggestionCard}
            >
              <View style={styles.suggestionIcon}>
                <Ionicons name="trending-down" size={24} color="#00f19f" />
              </View>
              <View style={styles.suggestionContent}>
                <Text style={styles.suggestionTitle}>Reduce Stress-Based Spending</Text>
                <Text style={styles.suggestionDescription}>
                  You spend 35% more when stressed. Consider implementing a 24-hour waiting period for purchases over 500 MAD during these times.
                </Text>
              </View>
            </LinearGradient>
            
            <LinearGradient
              colors={['rgba(76, 175, 80, 0.2)', 'rgba(76, 175, 80, 0.05)']}
              style={styles.suggestionCard}
            >
              <View style={[styles.suggestionIcon, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
                <Ionicons name="timer-outline" size={24} color="#4CAF50" />
              </View>
              <View style={styles.suggestionContent}>
                <Text style={styles.suggestionTitle}>Optimal Time for Financial Planning</Text>
                <Text style={styles.suggestionDescription}>
                  Your decisions are most balanced between 2-4 PM when your emotional state is typically neutral or content.
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>
      )}
      
      {/* Personalized Tab Content */}
      {activeTab === 'personalized' && (
        <View style={styles.tabContent}>
          {/* Personalized Insights */}
          <View style={styles.personalizedContainer}>
            {personalizedInsights.map((insight) => (
              <LinearGradient
                key={insight.id}
                colors={['#2A363D', '#1A2125']}
                style={styles.insightCard}
              >
                <View style={styles.insightIconContainer}>
                  <Ionicons name={insight.icon as any} size={24} color={insight.color} />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <Text style={styles.insightDescription}>{insight.description}</Text>
                </View>
              </LinearGradient>
            ))}
          </View>
          
          {/* Emotion-Finance Connection */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Emotion-Finance Connection</Text>
            </View>
            
            <LinearGradient
              colors={['#2A363D', '#1A2125']}
              style={styles.connectionCard}
            >
              <View style={styles.connectionHeader}>
                <MaterialCommunityIcons name="brain" size={20} color="#00f19f" />
                <Text style={styles.connectionTitle}>Your Unique Patterns</Text>
              </View>
              
              <View style={styles.connectionItem}>
                <View style={styles.connectionEmotionContainer}>
                  <MaterialCommunityIcons 
                    name={emotionConfig.stressed.icon as any} 
                    size={20} 
                    color={emotionConfig.stressed.color} 
                    style={styles.connectionIcon}
                  />
                  <Text style={[styles.connectionEmotion, { color: emotionConfig.stressed.color }]}>
                    Stressed
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color="#8E8E93" style={styles.arrowIcon} />
                <View style={styles.connectionBehavior}>
                  <Text style={styles.connectionBehaviorText}>Impulse purchases, food delivery</Text>
                </View>
              </View>
              
              <View style={styles.connectionItem}>
                <View style={styles.connectionEmotionContainer}>
                  <MaterialCommunityIcons 
                    name={emotionConfig.content.icon as any} 
                    size={20} 
                    color={emotionConfig.content.color} 
                    style={styles.connectionIcon}
                  />
                  <Text style={[styles.connectionEmotion, { color: emotionConfig.content.color }]}>
                    Content
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color="#8E8E93" style={styles.arrowIcon} />
                <View style={styles.connectionBehavior}>
                  <Text style={styles.connectionBehaviorText}>Planned purchases, saving</Text>
                </View>
              </View>
              
              <View style={styles.connectionItem}>
                <View style={styles.connectionEmotionContainer}>
                  <MaterialCommunityIcons 
                    name={emotionConfig.happy.icon as any} 
                    size={20} 
                    color={emotionConfig.happy.color} 
                    style={styles.connectionIcon}
                  />
                  <Text style={[styles.connectionEmotion, { color: emotionConfig.happy.color }]}>
                    Happy
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color="#8E8E93" style={styles.arrowIcon} />
                <View style={styles.connectionBehavior}>
                  <Text style={styles.connectionBehaviorText}>Experience spending, donations</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
          
          {/* Custom Insight */}
          <LinearGradient
            colors={['rgba(0, 241, 159, 0.2)', 'rgba(0, 241, 159, 0.05)']}
            style={styles.customInsightCard}
          >
            <View style={styles.customInsightHeader}>
              <Ionicons name="sparkles" size={24} color="#00f19f" />
              <Text style={styles.customInsightTitle}>Personal AI Insight</Text>
            </View>
            <Text style={styles.customInsightText}>
              Based on your recent emotional and spending patterns, we've identified that you're more likely to invest when your recovery score is above 80%. With your current recovery score at 87%, this could be an optimal time to review your investment portfolio.
            </Text>
            <TouchableOpacity style={styles.customInsightButton}>
              <Text style={styles.customInsightButtonText}>View Investment Options</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}
      
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A363D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#3A3A3A',
  },
  tabText: {
    fontSize: 14,
    color: '#D0D0D0',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabContent: {
    paddingBottom: 16,
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
  chartCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  legendContainer: {
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendLabel: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  legendValue: {
    fontSize: 12,
    color: '#D0D0D0',
  },
  legendPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  suggestionCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  suggestionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 241, 159, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  suggestionDescription: {
    fontSize: 14,
    color: '#D0D0D0',
    lineHeight: 20,
  },
  personalizedContainer: {
    paddingHorizontal: 16,
  },
  insightCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(42, 42, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: '#D0D0D0',
    lineHeight: 20,
  },
  connectionCard: {
    borderRadius: 16,
    padding: 16,
  },
  connectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  connectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  connectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  connectionEmotionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '30%',
  },
  connectionIcon: {
    marginRight: 4,
  },
  connectionEmotion: {
    fontSize: 14,
    fontWeight: '500',
  },
  arrowIcon: {
    marginHorizontal: 8,
  },
  connectionBehavior: {
    flex: 1,
  },
  connectionBehaviorText: {
    fontSize: 14,
    color: '#D0D0D0',
  },
  customInsightCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
  },
  customInsightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  customInsightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  customInsightText: {
    fontSize: 14,
    color: '#D0D0D0',
    lineHeight: 22,
    marginBottom: 16,
  },
  customInsightButton: {
    backgroundColor: '#00f19f',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  customInsightButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
});