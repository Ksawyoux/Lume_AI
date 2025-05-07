import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Spending By Emotion Card Component
const SpendingByEmotionCard = () => {
  // Sample data
  const emotionSpending = [
    { emotion: 'happy', amount: 420, percentage: 28 },
    { emotion: 'content', amount: 350, percentage: 23 },
    { emotion: 'neutral', amount: 280, percentage: 19 },
    { emotion: 'worried', amount: 230, percentage: 15 },
    { emotion: 'stressed', amount: 220, percentage: 15 },
  ];
  
  const emotionColors = {
    happy: '#52c41a',
    content: '#1890ff',
    neutral: '#bfbfbf',
    worried: '#faad14',
    stressed: '#ff4d4f',
  };
  
  const emotionIcons = {
    happy: '😊',
    content: '😌',
    neutral: '😐',
    worried: '😟',
    stressed: '😫',
  };
  
  return (
    <View style={styles.insightCard}>
      <Text style={styles.insightCardTitle}>Spending by Emotion</Text>
      <Text style={styles.insightCardDescription}>
        Understand how your emotional states correlate with your spending patterns.
      </Text>
      
      <View style={styles.emotionBarChart}>
        {emotionSpending.map((item) => (
          <View key={item.emotion} style={styles.emotionBarItem}>
            <View style={styles.emotionBarHeader}>
              <View style={styles.emotionLabelContainer}>
                <Text style={styles.emotionIcon}>{emotionIcons[item.emotion]}</Text>
                <Text style={styles.emotionLabel}>
                  {item.emotion.charAt(0).toUpperCase() + item.emotion.slice(1)}
                </Text>
              </View>
              <Text style={styles.emotionAmount}>${item.amount}</Text>
            </View>
            <View style={styles.emotionBarContainer}>
              <View 
                style={[
                  styles.emotionBar, 
                  { 
                    width: `${item.percentage}%`, 
                    backgroundColor: emotionColors[item.emotion] 
                  }
                ]} 
              />
            </View>
          </View>
        ))}
      </View>
      
      <Text style={styles.insightTip}>
        You tend to spend more when you're happy or content, which is normal. Try tracking your spending when feeling happy to ensure you're making conscious financial decisions.
      </Text>
    </View>
  );
};

// Recent Insight Card Component
const InsightCard = ({ title, date, description, tips, icon, color }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <TouchableOpacity 
      style={styles.insightCard} 
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
    >
      <View style={styles.insightCardHeader}>
        <View style={[styles.insightIcon, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <View style={styles.insightCardHeaderContent}>
          <Text style={styles.insightCardTitle}>{title}</Text>
          <Text style={styles.insightDate}>{date}</Text>
        </View>
        <Ionicons 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#888" 
        />
      </View>
      
      {expanded && (
        <View style={styles.insightCardContent}>
          <Text style={styles.insightCardDescription}>{description}</Text>
          
          {tips.length > 0 && (
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>Recommendations:</Text>
              {tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={16} color={color} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

// Score Correlation Component
const ScoreCorrelation = () => {
  return (
    <View style={styles.correlationCard}>
      <Text style={styles.insightCardTitle}>Score Correlations</Text>
      <Text style={styles.insightCardDescription}>
        How your health metrics correlate with financial behavior
      </Text>
      
      <View style={styles.correlationItems}>
        <View style={styles.correlationItem}>
          <View style={styles.correlationHeader}>
            <Text style={styles.correlationLabel}>Recovery & Spending</Text>
            <Text style={[styles.correlationValue, { color: '#ff4d4f' }]}>-65%</Text>
          </View>
          <Text style={styles.correlationDescription}>
            Low recovery scores correlate with higher discretionary spending
          </Text>
        </View>
        
        <View style={styles.correlationItem}>
          <View style={styles.correlationHeader}>
            <Text style={styles.correlationLabel}>Sleep & Saving</Text>
            <Text style={[styles.correlationValue, { color: '#52c41a' }]}>+72%</Text>
          </View>
          <Text style={styles.correlationDescription}>
            Better sleep quality is strongly correlated with higher savings rates
          </Text>
        </View>
        
        <View style={styles.correlationItem}>
          <View style={styles.correlationHeader}>
            <Text style={styles.correlationLabel}>Emotion & Investment</Text>
            <Text style={[styles.correlationValue, { color: '#faad14' }]}>-28%</Text>
          </View>
          <Text style={styles.correlationDescription}>
            Negative emotions slightly correlate with more conservative investments
          </Text>
        </View>
      </View>
    </View>
  );
};

export default function InsightsScreen() {
  // Sample insights data
  const insights = [
    {
      id: 1,
      title: "Sleep Quality Impact",
      date: "Today",
      description: "On days when your sleep score is below 70, you tend to spend 35% more on takeout and convenience food. Getting better sleep could help you save on these expenses.",
      tips: [
        "Set a regular sleep schedule",
        "Try to get 7-8 hours of sleep",
        "Avoid screens before bedtime"
      ],
      icon: "moon-outline",
      color: "#7551FF"
    },
    {
      id: 2,
      title: "Stress Spending Pattern",
      date: "Yesterday",
      description: "We've noticed that when you record 'stressed' emotions, your online shopping increases by 45% compared to days when you're feeling 'content' or 'happy'.",
      tips: [
        "Consider a 24-hour waiting period for online purchases",
        "Practice stress-reduction techniques before shopping",
        "Create a budget specifically for stress relief activities"
      ],
      icon: "trending-up-outline",
      color: "#ff4d4f"
    },
    {
      id: 3,
      title: "Weekend Recovery Boost",
      date: "3 days ago",
      description: "Your financial discipline improves by 28% when your weekend recovery score is above 80. Consider prioritizing recovery on weekends.",
      tips: [
        "Limit alcohol consumption on weekends",
        "Schedule time for light activity and proper rest",
        "Go to bed at a consistent time even on weekends"
      ],
      icon: "battery-charging-outline",
      color: "#00f19f"
    },
    {
      id: 4,
      title: "Morning Workout Benefits",
      date: "Last week",
      description: "Days that start with morning workouts show a 22% decrease in impulse purchases and better financial decision-making overall.",
      tips: [
        "Try to establish a morning exercise routine",
        "Even a 15-minute workout can provide benefits",
        "Combine with mindfulness for added emotional stability"
      ],
      icon: "fitness-outline",
      color: "#FFB443"
    },
  ];
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Personalized Insights</Text>
          <Text style={styles.headerSubtitle}>
            Understand the connections between your health, emotions, and finances
          </Text>
        </View>
        
        <View style={styles.insightsContainer}>
          <SpendingByEmotionCard />
          
          <ScoreCorrelation />
          
          <View style={styles.recentInsights}>
            <Text style={styles.sectionTitle}>Recent Insights</Text>
            
            {insights.map((insight) => (
              <InsightCard 
                key={insight.id}
                title={insight.title}
                date={insight.date}
                description={insight.description}
                tips={insight.tips}
                icon={insight.icon}
                color={insight.color}
              />
            ))}
          </View>
          
          <View style={styles.analysisContainer}>
            <Text style={styles.sectionTitle}>Custom Analysis</Text>
            <Text style={styles.analysisDescription}>
              Want more specific insights? You can request a custom analysis for personalized financial recommendations.
            </Text>
            
            <TouchableOpacity style={styles.analysisButton}>
              <Text style={styles.analysisButtonText}>Generate Custom Insights</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 4,
  },
  insightsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  insightCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightCardHeaderContent: {
    flex: 1,
  },
  insightCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  insightDate: {
    fontSize: 12,
    color: '#888',
  },
  insightCardContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  insightCardDescription: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 20,
    marginBottom: 12,
  },
  tipsContainer: {
    marginTop: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ccc',
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    color: '#aaa',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  // Emotion spending chart
  emotionBarChart: {
    marginVertical: 16,
  },
  emotionBarItem: {
    marginBottom: 12,
  },
  emotionBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  emotionLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emotionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  emotionLabel: {
    color: '#ccc',
    fontSize: 14,
  },
  emotionAmount: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emotionBarContainer: {
    height: 8,
    backgroundColor: '#2d2d2d',
    borderRadius: 4,
    overflow: 'hidden',
  },
  emotionBar: {
    height: '100%',
    borderRadius: 4,
  },
  insightTip: {
    color: '#aaa',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    backgroundColor: '#2d2d2d',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#00f19f',
  },
  // Score correlation
  correlationCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  correlationItems: {
    marginTop: 16,
  },
  correlationItem: {
    marginBottom: 16,
  },
  correlationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  correlationLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  correlationValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  correlationDescription: {
    color: '#888',
    fontSize: 12,
  },
  // Recent insights
  recentInsights: {
    marginBottom: 24,
  },
  // Custom analysis
  analysisContainer: {
    marginBottom: 40,
  },
  analysisDescription: {
    color: '#aaa',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  analysisButton: {
    backgroundColor: '#00f19f',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analysisButtonText: {
    color: '#121212',
    fontWeight: 'bold',
    fontSize: 16,
  },
});