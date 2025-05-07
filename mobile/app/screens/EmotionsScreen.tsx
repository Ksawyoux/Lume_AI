import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Camera from 'expo-camera';

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

interface EmotionHistoryItem {
  id: string;
  type: EmotionType;
  notes: string;
  date: Date;
  transactions?: Array<{
    id: string;
    amount: number;
    description: string;
  }>;
}

interface EmotionAnalysisResult {
  primaryEmotion: string;
  emotionIntensity: number; // 0-1 scale
  detectedEmotions: string[];
  emotionalTriggers: string[];
  recommendations: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0-1 scale
}

export default function EmotionsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<EmotionAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  
  // Sample emotion history
  const [emotionHistory, setEmotionHistory] = useState<EmotionHistoryItem[]>([
    {
      id: '1',
      type: 'content',
      notes: 'Feeling good today after my morning workout. Energy levels are high.',
      date: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      transactions: [
        { id: 't1', amount: -12.99, description: 'Coffee Shop' },
        { id: 't2', amount: -24.50, description: 'Lunch with team' }
      ]
    },
    {
      id: '2',
      type: 'stressed',
      notes: 'Project deadline approaching. Feeling pressure to deliver on time.',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      transactions: [
        { id: 't3', amount: -49.99, description: 'Online Shopping' },
        { id: 't4', amount: -32.79, description: 'Food Delivery' }
      ]
    },
    {
      id: '3',
      type: 'happy',
      notes: 'Got a promotion at work! Feeling accomplished and motivated.',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      transactions: [
        { id: 't5', amount: -158.45, description: 'Celebration Dinner' }
      ]
    },
  ]);
  
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(status === 'granted');
    })();
  }, []);
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    
    // Simulate a network request
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  const handleEmotionSelect = (emotion: EmotionType) => {
    setSelectedEmotion(emotion);
  };
  
  const handleSaveEmotion = () => {
    if (!selectedEmotion) return;
    
    setIsSaving(true);
    
    // Simulate network request
    setTimeout(() => {
      const newEmotion: EmotionHistoryItem = {
        id: Date.now().toString(),
        type: selectedEmotion,
        notes,
        date: new Date(),
      };
      
      setEmotionHistory([newEmotion, ...emotionHistory]);
      setSelectedEmotion(null);
      setNotes('');
      setIsSaving(false);
    }, 1000);
  };
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };
  
  const analyzeNotes = () => {
    if (!notes.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setAnalysisResult({
        primaryEmotion: 'content',
        emotionIntensity: 0.75,
        detectedEmotions: ['contentment', 'satisfaction', 'optimism'],
        emotionalTriggers: ['accomplishment', 'social connection'],
        recommendations: [
          'Consider investing in quality experiences rather than material purchases',
          'This positive state is good for financial planning without stress bias'
        ],
        sentiment: 'positive',
        confidence: 0.82
      });
      setIsAnalyzing(false);
      // Automatically select the primary emotion
      setSelectedEmotion('content');
    }, 1500);
  };
  
  const toggleCamera = () => {
    setShowCamera(!showCamera);
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
          <Text style={styles.headerTitle}>Emotions</Text>
          <Text style={styles.headerSubtitle}>Track your emotional journey</Text>
        </View>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons name="emoticon" size={20} color="#00f19f" />
        </View>
      </View>
      
      {/* Emotion Input */}
      <View style={styles.emotionInputContainer}>
        <LinearGradient
          colors={['#2A363D', '#1A2125']}
          style={styles.emotionInputCard}
        >
          <Text style={styles.emotionInputTitle}>How are you feeling?</Text>
          
          {/* Emotion Selection */}
          <View style={styles.emotionSelection}>
            {Object.entries(emotionConfig).map(([key, config]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.emotionOption,
                  selectedEmotion === key && { backgroundColor: config.backgroundColor }
                ]}
                onPress={() => handleEmotionSelect(key as EmotionType)}
              >
                <MaterialCommunityIcons
                  name={config.icon as any}
                  size={28}
                  color={config.color}
                  style={styles.emotionIcon}
                />
                <Text style={[styles.emotionLabel, { color: config.color }]}>
                  {config.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Notes Input */}
          <View style={styles.notesContainer}>
            <TextInput
              style={styles.notesInput}
              placeholder="Describe how you're feeling..."
              placeholderTextColor="#8E8E93"
              multiline
              value={notes}
              onChangeText={setNotes}
            />
            
            <View style={styles.notesActions}>
              <TouchableOpacity 
                style={[styles.iconButton, !notes.trim() && styles.disabledButton]}
                onPress={analyzeNotes}
                disabled={!notes.trim() || isAnalyzing}
              >
                {isAnalyzing ? (
                  <ActivityIndicator size="small" color="#00f19f" />
                ) : (
                  <Ionicons name="analytics" size={20} color={notes.trim() ? "#00f19f" : "#8E8E93"} />
                )}
              </TouchableOpacity>
              
              {cameraPermission && (
                <TouchableOpacity style={styles.iconButton} onPress={toggleCamera}>
                  <Ionicons name="camera" size={20} color="#00f19f" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {/* Camera View - Simplified for this example */}
          {showCamera && (
            <View style={styles.cameraContainer}>
              <Text style={styles.cameraPlaceholder}>Camera would appear here</Text>
              <TouchableOpacity style={styles.closeCameraButton} onPress={toggleCamera}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
          
          {/* Analysis Results */}
          {analysisResult && (
            <View style={styles.analysisContainer}>
              <LinearGradient
                colors={['rgba(0, 241, 159, 0.2)', 'rgba(0, 241, 159, 0.05)']}
                style={styles.analysisCard}
              >
                <View style={styles.analysisHeader}>
                  <Ionicons name="analytics" size={20} color="#00f19f" />
                  <Text style={styles.analysisTitle}>AI Analysis</Text>
                  <Text style={styles.analysisConfidence}>
                    {Math.round(analysisResult.confidence * 100)}% confidence
                  </Text>
                </View>
                
                <View style={styles.analysisPrimaryEmotion}>
                  <Text style={styles.analysisLabel}>Primary Emotion:</Text>
                  <View style={styles.emotionPill}>
                    <MaterialCommunityIcons 
                      name={emotionConfig[analysisResult.primaryEmotion as EmotionType]?.icon as any || 'emoticon'} 
                      size={16} 
                      color={emotionConfig[analysisResult.primaryEmotion as EmotionType]?.color || '#00f19f'} 
                    />
                    <Text style={[
                      styles.emotionPillText, 
                      { color: emotionConfig[analysisResult.primaryEmotion as EmotionType]?.color || '#00f19f' }
                    ]}>
                      {emotionConfig[analysisResult.primaryEmotion as EmotionType]?.label || analysisResult.primaryEmotion}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.detectedEmotions}>
                  <Text style={styles.analysisLabel}>Detected Emotions:</Text>
                  <View style={styles.emotionTags}>
                    {analysisResult.detectedEmotions.map((emotion, index) => (
                      <View key={index} style={styles.emotionTag}>
                        <Text style={styles.emotionTagText}>{emotion}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                <View style={styles.recommendationsContainer}>
                  <Text style={styles.analysisLabel}>Financial Insights:</Text>
                  {analysisResult.recommendations.map((recommendation, index) => (
                    <View key={index} style={styles.recommendationItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#00f19f" style={styles.recommendationIcon} />
                      <Text style={styles.recommendationText}>{recommendation}</Text>
                    </View>
                  ))}
                </View>
              </LinearGradient>
            </View>
          )}
          
          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, (!selectedEmotion) && styles.disabledButton]}
            onPress={handleSaveEmotion}
            disabled={!selectedEmotion || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <Text style={styles.saveButtonText}>Save Emotion</Text>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </View>
      
      {/* Emotion History */}
      <View style={styles.historyContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Emotion History</Text>
        </View>
        
        {emotionHistory.map((item) => (
          <LinearGradient
            key={item.id}
            colors={['#2A363D', '#1A2125']}
            style={styles.historyCard}
          >
            <View style={styles.historyHeader}>
              <View style={styles.historyEmotion}>
                <MaterialCommunityIcons
                  name={emotionConfig[item.type].icon as any}
                  size={24}
                  color={emotionConfig[item.type].color}
                />
                <Text style={[styles.historyEmotionText, { color: emotionConfig[item.type].color }]}>
                  {emotionConfig[item.type].label}
                </Text>
              </View>
              <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
            </View>
            
            <Text style={styles.historyNotes}>{item.notes}</Text>
            
            {item.transactions && item.transactions.length > 0 && (
              <View style={styles.transactionsContainer}>
                <Text style={styles.transactionsTitle}>Related Transactions</Text>
                {item.transactions.map((transaction) => (
                  <View key={transaction.id} style={styles.transactionItem}>
                    <Text style={styles.transactionDescription}>{transaction.description}</Text>
                    <Text style={styles.transactionAmount}>
                      ${transaction.amount.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </LinearGradient>
        ))}
      </View>
      
      {/* Empty space at bottom for navigation safety */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const { width } = Dimensions.get('window');

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
  emotionInputContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  emotionInputCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emotionInputTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  emotionSelection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  emotionOption: {
    width: (width - 64) / 3, // 16px padding on each side, 16px gap
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  emotionIcon: {
    marginBottom: 4,
  },
  emotionLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  notesContainer: {
    borderRadius: 12,
    backgroundColor: 'rgba(42, 42, 42, 0.5)',
    padding: 12,
    marginBottom: 16,
  },
  notesInput: {
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  notesActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 241, 159, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  cameraContainer: {
    height: 200,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  cameraPlaceholder: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  closeCameraButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analysisContainer: {
    marginBottom: 16,
  },
  analysisCard: {
    borderRadius: 12,
    padding: 12,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  analysisConfidence: {
    fontSize: 12,
    color: '#00f19f',
  },
  analysisPrimaryEmotion: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  analysisLabel: {
    fontSize: 14,
    color: '#D0D0D0',
    marginRight: 8,
    flex: 1,
  },
  emotionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(42, 42, 42, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  emotionPillText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  detectedEmotions: {
    marginBottom: 12,
  },
  emotionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  emotionTag: {
    backgroundColor: 'rgba(42, 42, 42, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  emotionTagText: {
    fontSize: 12,
    color: '#D0D0D0',
  },
  recommendationsContainer: {
    marginTop: 4,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationIcon: {
    marginRight: 6,
    marginTop: 2,
  },
  recommendationText: {
    fontSize: 12,
    color: '#D0D0D0',
    flex: 1,
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: '#00f19f',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  historyContainer: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  historyCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyEmotion: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyEmotionText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  historyDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  historyNotes: {
    fontSize: 14,
    color: '#D0D0D0',
    lineHeight: 20,
    marginBottom: 12,
  },
  transactionsContainer: {
    backgroundColor: 'rgba(42, 42, 42, 0.5)',
    borderRadius: 12,
    padding: 12,
  },
  transactionsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionDescription: {
    fontSize: 12,
    color: '#D0D0D0',
  },
  transactionAmount: {
    fontSize: 12,
    color: '#FF5252',
    fontWeight: '500',
  },
});