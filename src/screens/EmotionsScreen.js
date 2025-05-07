import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import { Ionicons } from '@expo/vector-icons';

// Emotion types and emoji mapping
const emotionTypes = {
  happy: { emoji: '😊', color: '#52c41a', label: 'Happy' },
  content: { emoji: '😌', color: '#1890ff', label: 'Content' },
  neutral: { emoji: '😐', color: '#bfbfbf', label: 'Neutral' },
  worried: { emoji: '😟', color: '#faad14', label: 'Worried' },
  stressed: { emoji: '😫', color: '#ff4d4f', label: 'Stressed' },
};

// Emotion Selector Component
const EmojiSelector = ({ selectedEmotion, onSelect }) => {
  return (
    <View style={styles.emojiSelectorContainer}>
      {Object.entries(emotionTypes).map(([type, { emoji, color, label }]) => (
        <TouchableOpacity
          key={type}
          style={[
            styles.emojiButton,
            selectedEmotion === type && { borderColor: color, backgroundColor: `${color}20` }
          ]}
          onPress={() => onSelect(type)}
        >
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={[styles.emojiLabel, selectedEmotion === type && { color }]}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Emotion Tracker Component
const EmotionTracker = () => {
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [notes, setNotes] = useState('');
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  // Request camera permissions
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  
  const handleDetection = ({ faces }) => {
    if (faces.length > 0 && !isAnalyzing) {
      setIsAnalyzing(true);
      
      // Simulate emotion detection - in a real app this would use face-api.js or ML
      const emotions = ['happy', 'content', 'neutral', 'worried', 'stressed'];
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      const randomConfidence = (Math.random() * 0.5 + 0.5).toFixed(2); // 0.5-1.0
      
      setTimeout(() => {
        setIsCameraVisible(false);
        setSelectedEmotion(randomEmotion);
        setIsAnalyzing(false);
        
        Alert.alert(
          "Emotion Detected",
          `We detected that you're feeling ${emotionTypes[randomEmotion].label} with ${randomConfidence} confidence.`,
          [{ text: "OK" }]
        );
      }, 2000);
    }
  };
  
  const handleSubmit = async () => {
    if (!selectedEmotion) {
      Alert.alert("Please select an emotion");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call to backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAnalysisResult({
        primaryEmotion: selectedEmotion,
        emotionIntensity: 0.85,
        detectedEmotions: [selectedEmotion, 'neutral'],
        emotionalTriggers: ['work stress', 'financial concerns'],
        recommendations: [
          'Take short breaks during work',
          'Practice 5-minute meditation',
          'Consider limiting financial decisions when stressed'
        ],
        sentiment: selectedEmotion === 'happy' || selectedEmotion === 'content' ? 'positive' : 
                  selectedEmotion === 'neutral' ? 'neutral' : 'negative',
        confidence: 0.92
      });
      
      // Reset form after successful submission
      setNotes('');
      
      Alert.alert(
        "Emotion Recorded",
        "Your emotional state has been recorded and analyzed.",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to submit your emotion. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>No access to camera</Text>
        <Text style={styles.permissionSubtext}>
          Camera permission is required to use the facial emotion detection feature.
        </Text>
      </View>
    );
  }
  
  return (
    <View style={styles.trackerContainer}>
      <Modal
        visible={isCameraVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsCameraVisible(false)}
      >
        <SafeAreaView style={styles.cameraContainer}>
          <View style={styles.cameraHeaderBar}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setIsCameraVisible(false)}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.cameraTitle}>Face Detection</Text>
          </View>
          
          <View style={styles.cameraPreview}>
            {hasPermission && (
              <Camera
                style={styles.camera}
                type={Camera.Constants.Type.front}
                onFacesDetected={handleDetection}
                faceDetectorSettings={{
                  mode: FaceDetector.FaceDetectorMode.fast,
                  detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
                  runClassifications: FaceDetector.FaceDetectorClassifications.all,
                  minDetectionInterval: 100,
                  tracking: true,
                }}
              />
            )}
            
            {isAnalyzing && (
              <View style={styles.analyzingOverlay}>
                <ActivityIndicator size="large" color="#00f19f" />
                <Text style={styles.analyzingText}>Analyzing your emotional state...</Text>
              </View>
            )}
          </View>
          
          <View style={styles.cameraInstructions}>
            <Text style={styles.instructionsText}>
              Position your face in the frame and keep a neutral expression.
            </Text>
            <Text style={styles.instructionsSubtext}>
              We'll analyze your facial expressions to detect your current emotional state.
            </Text>
          </View>
        </SafeAreaView>
      </Modal>
      
      <Text style={styles.trackerTitle}>How are you feeling today?</Text>
      <Text style={styles.trackerSubtitle}>
        Track your emotional state to see correlations with your financial decisions.
      </Text>
      
      <EmojiSelector
        selectedEmotion={selectedEmotion}
        onSelect={setSelectedEmotion}
      />
      
      <View style={styles.cameraButtonContainer}>
        <TouchableOpacity 
          style={styles.cameraButton}
          onPress={() => setIsCameraVisible(true)}
        >
          <Ionicons name="camera-outline" size={22} color="#fff" />
          <Text style={styles.cameraButtonText}>Use Camera Detection</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.notesContainer}>
        <Text style={styles.notesLabel}>What's driving this feeling? (Optional)</Text>
        <TextInput
          style={styles.notesInput}
          multiline
          placeholder="e.g., Work stress, Family celebration, Financial concerns..."
          placeholderTextColor="#666"
          value={notes}
          onChangeText={setNotes}
        />
      </View>
      
      <TouchableOpacity 
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#121212" />
        ) : (
          <Text style={styles.submitButtonText}>Record Emotion</Text>
        )}
      </TouchableOpacity>
      
      {analysisResult && (
        <View style={styles.analysisContainer}>
          <Text style={styles.analysisTitle}>Emotion Analysis</Text>
          
          <View style={styles.analysisCard}>
            <View style={styles.analysisHeader}>
              <View style={[styles.emotionBadge, { backgroundColor: emotionTypes[analysisResult.primaryEmotion].color }]}>
                <Text style={styles.emotionBadgeText}>{emotionTypes[analysisResult.primaryEmotion].label}</Text>
              </View>
              <Text style={styles.confidenceText}>
                {Math.round(analysisResult.confidence * 100)}% confidence
              </Text>
            </View>
            
            <View style={styles.recommendationsContainer}>
              <Text style={styles.recommendationsTitle}>Recommendations:</Text>
              {analysisResult.recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#00f19f" />
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default function EmotionsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Emotion Tracking</Text>
          <Text style={styles.headerSubtitle}>
            Understand how your emotions impact your financial decisions
          </Text>
        </View>
        
        <EmotionTracker />
        
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Recent Emotions</Text>
            <TouchableOpacity>
              <Text style={styles.historyViewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.emotionHistoryList}>
            <View style={styles.emotionHistoryItem}>
              <View style={styles.emotionIconContainer}>
                <Text style={styles.emotionHistoryEmoji}>{emotionTypes.happy.emoji}</Text>
              </View>
              <View style={styles.emotionHistoryContent}>
                <View style={styles.emotionHistoryHeader}>
                  <Text style={styles.emotionHistoryType}>{emotionTypes.happy.label}</Text>
                  <Text style={styles.emotionHistoryTime}>Today, 10:30 AM</Text>
                </View>
                <Text style={styles.emotionHistoryNote}>
                  Finished a major project at work. Feeling accomplished.
                </Text>
              </View>
            </View>
            
            <View style={styles.emotionHistoryItem}>
              <View style={styles.emotionIconContainer}>
                <Text style={styles.emotionHistoryEmoji}>{emotionTypes.stressed.emoji}</Text>
              </View>
              <View style={styles.emotionHistoryContent}>
                <View style={styles.emotionHistoryHeader}>
                  <Text style={styles.emotionHistoryType}>{emotionTypes.stressed.label}</Text>
                  <Text style={styles.emotionHistoryTime}>Yesterday, 4:15 PM</Text>
                </View>
                <Text style={styles.emotionHistoryNote}>
                  Tight deadline approaching. Financial concerns about upcoming bills.
                </Text>
              </View>
            </View>
            
            <View style={styles.emotionHistoryItem}>
              <View style={styles.emotionIconContainer}>
                <Text style={styles.emotionHistoryEmoji}>{emotionTypes.content.emoji}</Text>
              </View>
              <View style={styles.emotionHistoryContent}>
                <View style={styles.emotionHistoryHeader}>
                  <Text style={styles.emotionHistoryType}>{emotionTypes.content.label}</Text>
                  <Text style={styles.emotionHistoryTime}>May 5, 8:45 AM</Text>
                </View>
                <Text style={styles.emotionHistoryNote}>
                  Morning meditation session. Feeling balanced and present.
                </Text>
              </View>
            </View>
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
  trackerContainer: {
    padding: 20,
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  trackerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  trackerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  emojiSelectorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  emojiButton: {
    width: (width - 80) / 5,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    padding: 8,
  },
  emoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  emojiLabel: {
    fontSize: 10,
    color: '#aaa',
    textAlign: 'center',
  },
  cameraButtonContainer: {
    marginBottom: 20,
  },
  cameraButton: {
    backgroundColor: '#2d2d2d',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  cameraButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 8,
  },
  notesContainer: {
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ccc',
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: '#2d2d2d',
    borderRadius: 8,
    height: 100,
    padding: 12,
    color: '#fff',
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#444',
  },
  submitButton: {
    backgroundColor: '#00f19f',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#121212',
    fontWeight: 'bold',
    fontSize: 16,
  },
  analysisContainer: {
    marginTop: 24,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  analysisCard: {
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    padding: 16,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emotionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  emotionBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  confidenceText: {
    color: '#aaa',
    fontSize: 12,
  },
  recommendationsContainer: {
    marginTop: 8,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ccc',
    marginBottom: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationText: {
    color: '#aaa',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  historyContainer: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  historyViewAll: {
    color: '#00f19f',
    fontSize: 14,
  },
  emotionHistoryList: {
    marginBottom: 12,
  },
  emotionHistoryItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  emotionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2d2d2d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emotionHistoryEmoji: {
    fontSize: 20,
  },
  emotionHistoryContent: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 12,
  },
  emotionHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  emotionHistoryType: {
    color: '#fff',
    fontWeight: '500',
  },
  emotionHistoryTime: {
    color: '#888',
    fontSize: 12,
  },
  emotionHistoryNote: {
    color: '#aaa',
    fontSize: 14,
  },
  // Camera screen styles
  cameraContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  cameraHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  closeButton: {
    padding: 4,
  },
  cameraTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  cameraPreview: {
    width: width,
    height: width * 4/3,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  cameraInstructions: {
    padding: 20,
  },
  instructionsText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    textAlign: 'center',
  },
  instructionsSubtext: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  permissionSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});