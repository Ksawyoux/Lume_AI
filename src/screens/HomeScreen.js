import React from 'react';
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

// Circle Progress Component
const CircleProgress = ({ percentage, size, color, title, value, subtitle }) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={styles.circleContainer}>
      <View style={{ width: size, height: size }}>
        <View style={[styles.circleBackground, { width: size, height: size, borderRadius: size / 2 }]} />
        <View 
          style={[
            styles.circleProgress, 
            { 
              width: size, 
              height: size, 
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: color,
              borderTopColor: 'transparent',
              borderRightColor: percentage < 50 ? 'transparent' : color,
              transform: [{ rotate: `${percentage * 3.6}deg` }]
            }
          ]} 
        />
        <View style={styles.circleContent}>
          <Text style={styles.circleTitle}>{title}</Text>
          <Text style={styles.circleValue}>{value}</Text>
          <Text style={styles.circleSubtitle}>{subtitle}</Text>
        </View>
      </View>
    </View>
  );
};

// Insight Card Component
const InsightCard = ({ icon, title, message, actionText }) => {
  return (
    <View style={styles.insightCard}>
      <View style={styles.insightIconContainer}>
        <Ionicons name={icon} size={24} color="#00f19f" />
      </View>
      <View style={styles.insightContent}>
        <Text style={styles.insightTitle}>{title}</Text>
        <Text style={styles.insightMessage}>{message}</Text>
        <TouchableOpacity style={styles.insightAction}>
          <Text style={styles.insightActionText}>{actionText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Recent Activity Component
const ActivityItem = ({ type, amount, date, description }) => {
  const isExpense = type === 'expense';
  return (
    <View style={styles.activityItem}>
      <View style={styles.activityLeft}>
        <View style={[styles.activityTypeIndicator, { backgroundColor: isExpense ? '#ff4d4f' : '#52c41a' }]}>
          <Ionicons name={isExpense ? 'arrow-down' : 'arrow-up'} size={12} color="white" />
        </View>
        <View>
          <Text style={styles.activityDescription}>{description}</Text>
          <Text style={styles.activityDate}>{date}</Text>
        </View>
      </View>
      <Text style={[styles.activityAmount, { color: isExpense ? '#ff4d4f' : '#52c41a' }]}>
        {isExpense ? '-' : '+'} ${amount}
      </Text>
    </View>
  );
};

export default function HomeScreen() {
  // Sample data
  const recoveryScore = 85;
  const sleepScore = 76;
  const emotionScore = 62;
  
  const activities = [
    { type: 'expense', amount: '52.38', description: 'Grocery shopping', date: 'Today, 2:30 PM' },
    { type: 'income', amount: '127.00', description: 'Client payment', date: 'Yesterday, 10:15 AM' },
    { type: 'expense', amount: '8.50', description: 'Coffee shop', date: 'May 5, 9:30 AM' },
  ];
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Good afternoon, Demo User</Text>
        <Text style={styles.date}>May 7, 2025</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.scoresContainer}>
          <Text style={styles.sectionTitle}>Your Scores</Text>
          <View style={styles.scoresRow}>
            <CircleProgress 
              percentage={recoveryScore}
              size={120}
              color="#00f19f"
              title="Recovery"
              value={recoveryScore}
              subtitle="Excellent"
            />
            <CircleProgress 
              percentage={sleepScore}
              size={120}
              color="#7551FF"
              title="Sleep"
              value={sleepScore}
              subtitle="Good"
            />
            <CircleProgress 
              percentage={emotionScore}
              size={120}
              color="#FFB443"
              title="Emotion"
              value={emotionScore}
              subtitle="Moderate"
            />
          </View>
        </View>
        
        <View style={styles.insightsContainer}>
          <Text style={styles.sectionTitle}>Personalized Insights</Text>
          <InsightCard 
            icon="bulb-outline"
            title="Financial Pattern Detected"
            message="We noticed you tend to spend more when your emotion score is below 65."
            actionText="See Details"
          />
          <InsightCard 
            icon="bar-chart-outline"
            title="Sleep Quality Impact"
            message="Better sleep is correlated with more positive spending decisions."
            actionText="Learn More"
          />
        </View>
        
        <View style={styles.activityContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {activities.map((activity, index) => (
              <ActivityItem key={index} {...activity} />
            ))}
          </View>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All Transactions</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  date: {
    fontSize: 16,
    color: '#888',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  scoresContainer: {
    marginTop: 10,
    marginBottom: 24,
  },
  scoresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  circleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  circleBackground: {
    backgroundColor: '#2d2d2d',
    position: 'absolute',
  },
  circleProgress: {
    position: 'absolute',
  },
  circleContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleTitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  circleValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  circleSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  insightsContainer: {
    marginBottom: 24,
  },
  insightCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#333',
  },
  insightIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 241, 159, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  insightMessage: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
    lineHeight: 20,
  },
  insightAction: {
    alignSelf: 'flex-start',
  },
  insightActionText: {
    color: '#00f19f',
    fontSize: 14,
    fontWeight: '500',
  },
  activityContainer: {
    marginBottom: 24,
  },
  activityList: {
    paddingHorizontal: 20,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityTypeIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  activityDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewAllButton: {
    marginTop: 16,
    alignSelf: 'center',
  },
  viewAllText: {
    color: '#00f19f',
    fontSize: 14,
    fontWeight: '500',
  },
});