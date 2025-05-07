import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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

interface EmotionAnalysisResult {
  primaryEmotion: string;
  emotionIntensity: number; // 0-1 scale
  detectedEmotions: string[];
  emotionalTriggers: string[];
  recommendations: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0-1 scale
}

export default function EmotionTracker() {
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<EmotionAnalysisResult | null>(null);
  
  const handleEmotionSelect = (emotion: EmotionType) => {
    setSelectedEmotion(emotion);
  };
  
  const handleSave = () => {
    if (!selectedEmotion) return;
    
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Saved emotion:', {
        type: selectedEmotion,
        notes,
        date: new Date()
      });
      
      // Reset form
      setSelectedEmotion(null);
      setNotes('');
      setIsSaving(false);
      setAnalysisResult(null);
    }, 1000);
  };
  
  const analyzeEmotion = () => {
    if (!notes.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const result: EmotionAnalysisResult = {
        primaryEmotion: 'content',
        emotionIntensity: 0.75,
        detectedEmotions: ['contentment', 'satisfaction', 'optimism'],
        emotionalTriggers: ['accomplishment', 'social connection'],
        recommendations: [
          'This is a good time for financial planning',
          'Consider focusing on long-term goals during this positive state'
        ],
        sentiment: 'positive',
        confidence: 0.82
      };
      
      setAnalysisResult(result);
      setIsAnalyzing(false);
      
      // Auto-select the detected emotion
      if (result.primaryEmotion in emotionConfig) {
        setSelectedEmotion(result.primaryEmotion as EmotionType);
      }
    }, 1500);
  };
  
  return (
    <LinearGradient
      colors={['#2A363D', '#1A2125']}
      style={styles.container}
    >
      {/* Emotion Selection */}
      <View style={styles.emotionSelectionContainer}>
        <Text style={styles.emotionTitle}>How are you feeling right now?</Text>
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
      </View>
      
      {/* Notes Input */}
      <View style={styles.notesContainer}>
        <View style={styles.notesHeader}>
          <Text style={styles.notesTitle}>What's on your mind?</Text>
          {notes.trim().length > 0 && (
            <TouchableOpacity
              style={styles.analyzeButton}
              onPress={analyzeEmotion}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <ActivityIndicator size="small" color="#00f19f" />
              ) : (
                <>
                  <Ionicons name="analytics" size={16} color="#00f19f" />
                  <Text style={styles.analyzeButtonText}>Analyze</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
        <TextInput
          style={styles.notesInput}
          placeholder="Describe how you're feeling..."
          placeholderTextColor="#8E8E93"
          multiline
          value={notes}
          onChangeText={setNotes}
        />
      </View>
      
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
        onPress={handleSave}
        disabled={!selectedEmotion || isSaving}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color="#000000" />
        ) : (
          <Text style={styles.saveButtonText}>Save</Text>
        )}
      </TouchableOpacity>
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
  emotionSelectionContainer: {
    marginBottom: 16,
  },
  emotionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  emotionSelection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emotionOption: {
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    width: '18%',
  },
  emotionIcon: {
    marginBottom: 4,
  },
  emotionLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  notesContainer: {
    marginBottom: 16,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 241, 159, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  analyzeButtonText: {
    fontSize: 12,
    color: '#00f19f',
    marginLeft: 4,
  },
  notesInput: {
    backgroundColor: 'rgba(42, 42, 42, 0.5)',
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    color: '#FFFFFF',
    fontSize: 14,
    textAlignVertical: 'top',
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
  detectedEmotions: {
    marginBottom: 12,
  },
  analysisLabel: {
    fontSize: 14,
    color: '#D0D0D0',
    marginBottom: 8,
  },
  emotionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  disabledButton: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
});