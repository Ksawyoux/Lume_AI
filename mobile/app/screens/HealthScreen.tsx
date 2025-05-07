import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

interface HealthMetric {
  id: string;
  title: string;
  value: number;
  unit: string;
  icon: string;
  color: string;
  max: number;
  min: number;
  change: number;
  status: string;
}

export default function HealthScreen() {
  const [refreshing, setRefreshing] = useState(false);
  
  // Sample health metrics data
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([
    {
      id: 'recovery',
      title: 'Recovery',
      value: 87,
      unit: '%',
      icon: 'fitness',
      color: '#00f19f',
      max: 100,
      min: 0,
      change: 15,
      status: 'Excellent'
    },
    {
      id: 'heart_rate',
      title: 'Heart Rate',
      value: 72,
      unit: 'bpm',
      icon: 'heart',
      color: '#FF5252',
      max: 180,
      min: 40,
      change: -3,
      status: 'Resting'
    },
    {
      id: 'sleep',
      title: 'Sleep Quality',
      value: 7.4,
      unit: 'hrs',
      icon: 'moon',
      color: '#9C27B0',
      max: 10,
      min: 0,
      change: 0.5,
      status: 'Good'
    },
    {
      id: 'steps',
      title: 'Steps',
      value: 8462,
      unit: 'steps',
      icon: 'footsteps',
      color: '#2196F3',
      max: 10000,
      min: 0,
      change: 1256,
      status: 'Active'
    },
  ]);
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    
    // Simulate network request
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  // Calculate fill percentage for circular progress
  const calculateFill = (metric: HealthMetric) => {
    if (metric.id === 'recovery' || metric.id === 'sleep_quality') {
      return metric.value; // These are already percentages
    } else if (metric.id === 'heart_rate') {
      // Calculate heart rate zones - this is a simple approximation
      const restingHR = 60;
      const maxHR = 180;
      const reserve = maxHR - restingHR;
      const currentReserve = metric.value - restingHR;
      return Math.max(0, Math.min(100, (currentReserve / reserve) * 100));
    } else if (metric.id === 'steps') {
      return Math.min(100, (metric.value / metric.max) * 100);
    } else if (metric.id === 'sleep') {
      return (metric.value / 9) * 100; // Assuming 9 hours is optimal
    }
    return 50; // Default value
  };
  
  // Calculate background color based on value
  const getBackgroundColor = (metric: HealthMetric) => {
    if (metric.id === 'recovery') {
      if (metric.value >= 80) return '#00f19f';
      if (metric.value >= 65) return '#4CAF50';
      if (metric.value >= 50) return '#FF9800';
      return '#FF5252';
    }
    return metric.color;
  };
  
  // Get the color for change indicators
  const getChangeColor = (change: number) => {
    if (change > 0) return '#00f19f';
    if (change < 0) return '#FF5252';
    return '#8E8E93';
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
          <Text style={styles.headerTitle}>Health</Text>
          <Text style={styles.headerSubtitle}>Daily metrics & recovery</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="fitness" size={20} color="#00f19f" />
        </View>
      </View>
      
      {/* Main Recovery Metric */}
      <View style={styles.mainMetricContainer}>
        <LinearGradient
          colors={['#2A363D', '#1A2125']}
          style={styles.mainMetricCard}
        >
          <View style={styles.mainMetricHeader}>
            <Text style={styles.mainMetricTitle}>Daily Recovery</Text>
            <View style={styles.mainMetricPill}>
              <Text style={styles.mainMetricPillText}>Today</Text>
            </View>
          </View>
          
          <View style={styles.circularProgressContainer}>
            <AnimatedCircularProgress
              size={160}
              width={15}
              fill={87}
              tintColor="#00f19f"
              backgroundColor="#2A2A2A"
              rotation={0}
              lineCap="round"
              duration={1000}
            >
              {(fill) => (
                <View style={styles.circularProgressContent}>
                  <Text style={styles.circularProgressValue}>87%</Text>
                  <View style={styles.circularProgressChangeRow}>
                    <Ionicons name="arrow-up" size={14} color="#00f19f" />
                    <Text style={styles.circularProgressChange}>15%</Text>
                  </View>
                  <Text style={styles.circularProgressStatus}>Excellent</Text>
                </View>
              )}
            </AnimatedCircularProgress>
          </View>
          
          <View style={styles.mainMetricInfo}>
            <Text style={styles.mainMetricInfoText}>Your recovery is excellent today! This is a good day for higher intensity training or activities.</Text>
          </View>
        </LinearGradient>
      </View>
      
      {/* Health Metrics Grid */}
      <View style={styles.metricsGrid}>
        {healthMetrics.filter(metric => metric.id !== 'recovery').map((metric) => (
          <LinearGradient
            key={metric.id}
            colors={['#2A363D', '#1A2125']}
            style={styles.metricCard}
          >
            <View style={styles.metricHeader}>
              <Ionicons name={metric.icon as any} size={20} color={metric.color} />
              <Text style={styles.metricTitle}>{metric.title}</Text>
            </View>
            
            <View style={styles.metricCircularContainer}>
              <AnimatedCircularProgress
                size={90}
                width={8}
                fill={calculateFill(metric)}
                tintColor={getBackgroundColor(metric)}
                backgroundColor="#2A2A2A"
                rotation={0}
                lineCap="round"
              >
                {(fill) => (
                  <View style={styles.metricCircularContent}>
                    <Text style={styles.metricValue}>{metric.value.toString()}{metric.unit}</Text>
                    <View style={styles.metricChangeRow}>
                      <Ionicons 
                        name={metric.change > 0 ? "arrow-up" : metric.change < 0 ? "arrow-down" : "remove"} 
                        size={10} 
                        color={getChangeColor(metric.change)} 
                      />
                      <Text style={[styles.metricChange, { color: getChangeColor(metric.change) }]}>
                        {Math.abs(metric.change)}{metric.unit}
                      </Text>
                    </View>
                  </View>
                )}
              </AnimatedCircularProgress>
            </View>
            
            <Text style={styles.metricStatus}>{metric.status}</Text>
          </LinearGradient>
        ))}
      </View>
      
      {/* Health and Finance Connection */}
      <LinearGradient
        colors={['rgba(0, 241, 159, 0.2)', 'rgba(0, 241, 159, 0.05)']}
        style={styles.insightCard}
      >
        <View style={styles.insightIcon}>
          <Ionicons name="analytics-outline" size={24} color="#00f19f" />
        </View>
        <View style={styles.insightContent}>
          <Text style={styles.insightTitle}>Health & Financial Insight</Text>
          <Text style={styles.insightDescription}>
            On days with high recovery scores, you tend to make 15% fewer impulse purchases. 
            Consider setting aside extra savings today!
          </Text>
        </View>
      </LinearGradient>
      
      {/* Health vs. Spending Correlation */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Health & Spending Correlation</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Details</Text>
          </TouchableOpacity>
        </View>
        
        <LinearGradient
          colors={['#2A363D', '#1A2125']}
          style={styles.correlationCard}
        >
          <View style={styles.correlationRow}>
            <View style={styles.correlationMetric}>
              <Ionicons name="fitness" size={18} color="#00f19f" />
              <Text style={styles.correlationLabel}>High Recovery</Text>
            </View>
            <Text style={styles.correlationArrow}>→</Text>
            <View style={styles.correlationImpact}>
              <Ionicons name="trending-down" size={18} color="#00f19f" />
              <Text style={styles.correlationImpactText}>-15% Impulse Spending</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.correlationRow}>
            <View style={styles.correlationMetric}>
              <Ionicons name="moon" size={18} color="#9C27B0" />
              <Text style={styles.correlationLabel}>Poor Sleep</Text>
            </View>
            <Text style={styles.correlationArrow}>→</Text>
            <View style={styles.correlationImpact}>
              <Ionicons name="fast-food" size={18} color="#FF5252" />
              <Text style={styles.correlationImpactText}>+28% Food Delivery</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.correlationRow}>
            <View style={styles.correlationMetric}>
              <Ionicons name="heart" size={18} color="#FF5252" />
              <Text style={styles.correlationLabel}>High HR Variability</Text>
            </View>
            <Text style={styles.correlationArrow}>→</Text>
            <View style={styles.correlationImpact}>
              <Ionicons name="trending-up" size={18} color="#00f19f" />
              <Text style={styles.correlationImpactText}>+10% Investment Rate</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
      
      {/* Empty space at bottom for navigation safety */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 16px padding on each side, 16px gap

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
  mainMetricContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  mainMetricCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mainMetricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainMetricTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  mainMetricPill: {
    backgroundColor: 'rgba(0, 241, 159, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mainMetricPillText: {
    fontSize: 12,
    color: '#00f19f',
    fontWeight: '500',
  },
  circularProgressContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  circularProgressContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgressValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  circularProgressChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  circularProgressChange: {
    fontSize: 14,
    color: '#00f19f',
    marginLeft: 2,
  },
  circularProgressStatus: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  mainMetricInfo: {
    backgroundColor: 'rgba(0, 241, 159, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  mainMetricInfoText: {
    fontSize: 14,
    color: '#D0D0D0',
    lineHeight: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    width: cardWidth,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  metricTitle: {
    fontSize: 14,
    color: '#D0D0D0',
    marginLeft: 6,
  },
  metricCircularContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  metricCircularContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  metricChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metricChange: {
    fontSize: 10,
    marginLeft: 2,
  },
  metricStatus: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  insightCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 241, 159, 0.1)',
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
  correlationCard: {
    borderRadius: 16,
    padding: 16,
  },
  correlationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  correlationMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '40%',
  },
  correlationLabel: {
    fontSize: 14,
    color: '#D0D0D0',
    marginLeft: 6,
  },
  correlationArrow: {
    fontSize: 16,
    color: '#8E8E93',
  },
  correlationImpact: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
  },
  correlationImpactText: {
    fontSize: 14,
    color: '#D0D0D0',
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#2A2A2A',
    marginVertical: 4,
  },
});