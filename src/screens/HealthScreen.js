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

// Health Metric Chart Component
const HealthMetricChart = ({ title, value, maxValue, unit, color, data }) => {
  const percentage = (value / maxValue) * 100;
  
  // Generate chart bars from data (previous 7 days)
  const renderChartBars = () => {
    return data.map((item, index) => {
      const barHeight = (item.value / maxValue) * 100;
      return (
        <View key={index} style={styles.chartBarColumn}>
          <View style={[styles.chartBar, { height: `${barHeight}%`, backgroundColor: color }]} />
          <Text style={styles.chartBarLabel}>{item.label}</Text>
        </View>
      );
    });
  };
  
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricTitle}>{title}</Text>
        <TouchableOpacity style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={20} color="#888" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.metricValue}>
        <Text style={styles.metricValueText}>{value}</Text>
        <Text style={styles.metricUnit}>{unit}</Text>
      </View>
      
      <View style={styles.chart}>
        <View style={styles.chartBars}>
          {renderChartBars()}
        </View>
      </View>
    </View>
  );
};

// Health Summary Component
const HealthSummary = ({ recoveryScore, sleepHours, readiness, strain }) => {
  return (
    <View style={styles.summaryContainer}>
      <View style={styles.circleProgress}>
        <View style={styles.circleOuter}>
          <View 
            style={[
              styles.circleFill, 
              { 
                backgroundColor: recoveryScore >= 80 ? '#00f19f' : 
                                recoveryScore >= 60 ? '#FFB443' : '#ff4d4f',
                width: `${recoveryScore}%`, 
                height: `${recoveryScore}%` 
              }
            ]} 
          />
          <View style={styles.circleInner}>
            <Text style={styles.circleLabel}>Recovery</Text>
            <Text style={styles.circleValue}>{recoveryScore}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.metricsGrid}>
        <View style={styles.metricGridItem}>
          <Ionicons name="bed-outline" size={24} color="#7551FF" />
          <Text style={styles.metricGridValue}>{sleepHours}h</Text>
          <Text style={styles.metricGridLabel}>Sleep</Text>
        </View>
        
        <View style={styles.metricGridItem}>
          <Ionicons name="battery-charging-outline" size={24} color="#00f19f" />
          <Text style={styles.metricGridValue}>{readiness}</Text>
          <Text style={styles.metricGridLabel}>Readiness</Text>
        </View>
        
        <View style={styles.metricGridItem}>
          <Ionicons name="fitness-outline" size={24} color="#FFB443" />
          <Text style={styles.metricGridValue}>{strain}</Text>
          <Text style={styles.metricGridLabel}>Strain</Text>
        </View>
      </View>
    </View>
  );
};

// Daily Activity Component
const DailyActivity = ({ steps, calories, activeMinutes }) => {
  return (
    <View style={styles.activityContainer}>
      <Text style={styles.sectionTitle}>Daily Activity</Text>
      
      <View style={styles.activityCards}>
        <View style={styles.activityCard}>
          <View style={styles.activityIconContainer}>
            <Ionicons name="footsteps-outline" size={24} color="#00f19f" />
          </View>
          <Text style={styles.activityValue}>{steps.toLocaleString()}</Text>
          <Text style={styles.activityLabel}>Steps</Text>
          <View style={styles.progressContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${Math.min((steps / 10000) * 100, 100)}%`, backgroundColor: '#00f19f' }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{Math.round((steps / 10000) * 100)}% of goal</Text>
        </View>
        
        <View style={styles.activityCard}>
          <View style={styles.activityIconContainer}>
            <Ionicons name="flame-outline" size={24} color="#FF6B6B" />
          </View>
          <Text style={styles.activityValue}>{calories}</Text>
          <Text style={styles.activityLabel}>Calories</Text>
          <View style={styles.progressContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${Math.min((calories / 2500) * 100, 100)}%`, backgroundColor: '#FF6B6B' }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{Math.round((calories / 2500) * 100)}% of goal</Text>
        </View>
        
        <View style={styles.activityCard}>
          <View style={styles.activityIconContainer}>
            <Ionicons name="stopwatch-outline" size={24} color="#7551FF" />
          </View>
          <Text style={styles.activityValue}>{activeMinutes}</Text>
          <Text style={styles.activityLabel}>Active Min</Text>
          <View style={styles.progressContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${Math.min((activeMinutes / 60) * 100, 100)}%`, backgroundColor: '#7551FF' }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{Math.round((activeMinutes / 60) * 100)}% of goal</Text>
        </View>
      </View>
    </View>
  );
};

export default function HealthScreen() {
  // Sample data
  const healthMetrics = {
    recoveryScore: 85,
    sleepHours: 7.5,
    readiness: 92,
    strain: 12.3,
    heartRate: 62,
    hrv: 65,
    respiratoryRate: 14.2,
    steps: 7860,
    calories: 1850,
    activeMinutes: 45
  };
  
  // Sample heart rate data for the past week
  const heartRateData = [
    { label: 'M', value: 64 },
    { label: 'T', value: 65 },
    { label: 'W', value: 61 },
    { label: 'T', value: 63 },
    { label: 'F', value: 68 },
    { label: 'S', value: 62 },
    { label: 'S', value: 62 }
  ];
  
  // Sample HRV data for the past week
  const hrvData = [
    { label: 'M', value: 58 },
    { label: 'T', value: 62 },
    { label: 'W', value: 59 },
    { label: 'T', value: 65 },
    { label: 'F', value: 57 },
    { label: 'S', value: 63 },
    { label: 'S', value: 65 }
  ];
  
  // Sample respiratory rate data for the past week
  const respiratoryRateData = [
    { label: 'M', value: 14.8 },
    { label: 'T', value: 14.5 },
    { label: 'W', value: 14.3 },
    { label: 'T', value: 14.1 },
    { label: 'F', value: 14.7 },
    { label: 'S', value: 14.4 },
    { label: 'S', value: 14.2 }
  ];
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Health Metrics</Text>
          <Text style={styles.headerSubtitle}>Track how your physical well-being affects your finances</Text>
        </View>
        
        <HealthSummary 
          recoveryScore={healthMetrics.recoveryScore}
          sleepHours={healthMetrics.sleepHours}
          readiness={healthMetrics.readiness}
          strain={healthMetrics.strain}
        />
        
        <DailyActivity 
          steps={healthMetrics.steps}
          calories={healthMetrics.calories}
          activeMinutes={healthMetrics.activeMinutes}
        />
        
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Detailed Metrics</Text>
          
          <HealthMetricChart 
            title="Resting Heart Rate"
            value={healthMetrics.heartRate}
            maxValue={100}
            unit="bpm"
            color="#FF6B6B"
            data={heartRateData}
          />
          
          <HealthMetricChart 
            title="Heart Rate Variability"
            value={healthMetrics.hrv}
            maxValue={100}
            unit="ms"
            color="#7551FF"
            data={hrvData}
          />
          
          <HealthMetricChart 
            title="Respiratory Rate"
            value={healthMetrics.respiratoryRate}
            maxValue={20}
            unit="br/min"
            color="#00f19f"
            data={respiratoryRateData}
          />
        </View>
        
        <View style={styles.connectContainer}>
          <Text style={styles.connectTitle}>Connect Health Devices</Text>
          <Text style={styles.connectDescription}>
            Link your wearable devices to get more accurate health metrics and insights.
          </Text>
          
          <View style={styles.deviceList}>
            <TouchableOpacity style={styles.deviceButton}>
              <View style={styles.deviceIcon}>
                <Ionicons name="watch-outline" size={24} color="#fff" />
              </View>
              <Text style={styles.deviceText}>Apple Watch</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.deviceButton}>
              <View style={styles.deviceIcon}>
                <Text style={styles.deviceLogoText}>W</Text>
              </View>
              <Text style={styles.deviceText}>WHOOP</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.deviceButton}>
              <View style={styles.deviceIcon}>
                <Ionicons name="fitness-outline" size={24} color="#fff" />
              </View>
              <Text style={styles.deviceText}>Fitbit</Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  // Health Summary
  summaryContainer: {
    padding: 20,
    marginBottom: 20,
  },
  circleProgress: {
    alignItems: 'center',
    marginBottom: 24,
  },
  circleOuter: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#2d2d2d',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  circleFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    borderTopRightRadius: 100,
  },
  circleInner: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleLabel: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 4,
  },
  circleValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricGridItem: {
    width: (width - 60) / 3,
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  metricGridValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  metricGridLabel: {
    color: '#888',
    fontSize: 12,
  },
  // Activity
  activityContainer: {
    padding: 20,
    marginBottom: 20,
  },
  activityCards: {
    flexDirection: 'column',
    gap: 12,
  },
  activityCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2d2d2d',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  activityLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 12,
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#2d2d2d',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    color: '#888',
    fontSize: 12,
  },
  // Metrics Charts
  metricsContainer: {
    padding: 20,
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  infoButton: {
    padding: 4,
  },
  metricValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  metricValueText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  metricUnit: {
    color: '#888',
    fontSize: 16,
    marginLeft: 4,
  },
  chart: {
    height: 100,
  },
  chartBars: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  chartBarColumn: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  chartBar: {
    width: '40%',
    minHeight: 4,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  chartBarLabel: {
    color: '#888',
    fontSize: 10,
    marginTop: 6,
  },
  // Connect Devices
  connectContainer: {
    padding: 20,
    marginBottom: 40,
  },
  connectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  connectDescription: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  deviceList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deviceButton: {
    alignItems: 'center',
  },
  deviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2d2d2d',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceLogoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  deviceText: {
    color: '#fff',
    fontSize: 14,
  },
});