import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

// Types
type EmotionType = 'stressed' | 'worried' | 'neutral' | 'content' | 'happy';
type TransactionCategory = 'food' | 'shopping' | 'transportation' | 'entertainment' | 'health' | 'housing' | 'utilities' | 'other';

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

const categoryConfig: Record<TransactionCategory, {
  label: string;
  icon: string;
  color: string;
}> = {
  food: {
    label: 'Food & Drink',
    icon: 'fast-food',
    color: '#FF9800'
  },
  shopping: {
    label: 'Shopping',
    icon: 'cart',
    color: '#E91E63'
  },
  transportation: {
    label: 'Transportation',
    icon: 'car',
    color: '#2196F3'
  },
  entertainment: {
    label: 'Entertainment',
    icon: 'film',
    color: '#9C27B0'
  },
  health: {
    label: 'Health',
    icon: 'fitness',
    color: '#4CAF50'
  },
  housing: {
    label: 'Housing',
    icon: 'home',
    color: '#795548'
  },
  utilities: {
    label: 'Utilities',
    icon: 'flash',
    color: '#FFC107'
  },
  other: {
    label: 'Other',
    icon: 'ellipsis-horizontal',
    color: '#607D8B'
  }
};

export default function AddTransactionScreen() {
  const navigation = useNavigation();
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentEmotion: EmotionType = 'content'; // This would normally be fetched from state/context
  
  useEffect(() => {
    // Pre-select current emotion
    setSelectedEmotion(currentEmotion);
  }, []);
  
  const handleCategorySelect = (category: TransactionCategory) => {
    setSelectedCategory(category);
  };
  
  const handleEmotionSelect = (emotion: EmotionType) => {
    setSelectedEmotion(emotion);
  };
  
  const validateForm = (): boolean => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }
    
    if (!description) {
      Alert.alert('Error', 'Please enter a description');
      return false;
    }
    
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate network request
    setTimeout(() => {
      const transactionData = {
        amount: parseFloat(amount),
        description,
        category: selectedCategory,
        emotion: selectedEmotion,
        notes,
        date: new Date(),
        currency: 'MAD' // Hardcoded to Moroccan Dirham
      };
      
      console.log('Transaction data:', transactionData);
      
      // Reset form
      setAmount('');
      setDescription('');
      setSelectedCategory(null);
      setNotes('');
      setIsSubmitting(false);
      
      // Show success message
      Alert.alert(
        'Success',
        'Transaction added successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 1000);
  };
  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Transaction</Text>
          <View style={{ width: 24 }} />
        </View>
        
        {/* Transaction Form */}
        <View style={styles.formContainer}>
          {/* Amount Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Amount</Text>
            <View style={styles.amountInputRow}>
              <Text style={styles.currencySymbol}>د.م.</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="#8E8E93"
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>
          </View>
          
          {/* Description Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.textInput}
              value={description}
              onChangeText={setDescription}
              placeholder="What did you purchase?"
              placeholderTextColor="#8E8E93"
            />
          </View>
          
          {/* Category Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoryGrid}>
              {Object.entries(categoryConfig).map(([key, config]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.categoryItem,
                    selectedCategory === key && { backgroundColor: `${config.color}20` }
                  ]}
                  onPress={() => handleCategorySelect(key as TransactionCategory)}
                >
                  <View 
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: selectedCategory === key ? config.color : '#2A2A2A' }
                    ]}
                  >
                    <Ionicons name={config.icon as any} size={20} color="#FFFFFF" />
                  </View>
                  <Text style={styles.categoryLabel}>{config.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Emotion Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>How were you feeling?</Text>
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
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Additional Notes (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any additional context about this transaction?"
              placeholderTextColor="#8E8E93"
              multiline
            />
          </View>
          
          {/* Emotion-Spending Analysis */}
          {selectedEmotion && (
            <LinearGradient
              colors={[`${emotionConfig[selectedEmotion].color}20`, `${emotionConfig[selectedEmotion].color}05`]}
              style={styles.analysisCard}
            >
              <View style={styles.analysisIcon}>
                <MaterialCommunityIcons 
                  name={emotionConfig[selectedEmotion].icon as any} 
                  size={24} 
                  color={emotionConfig[selectedEmotion].color} 
                />
              </View>
              <View style={styles.analysisContent}>
                <Text style={styles.analysisTitle}>Emotional Spending Insight</Text>
                <Text style={styles.analysisDescription}>
                  {selectedEmotion === 'stressed' && "You typically spend 35% more when stressed. Consider a 24-hour waiting period for non-essential purchases."}
                  {selectedEmotion === 'worried' && "You tend to make more impulse purchases when worried. Try making a shopping list before buying."}
                  {selectedEmotion === 'neutral' && "Neutral emotional states are optimal for balanced spending decisions."}
                  {selectedEmotion === 'content' && "Content states tend to result in more thoughtful purchases that align with your goals."}
                  {selectedEmotion === 'happy' && "While happy, you're more likely to spend on experiences rather than material items. Consider if this purchase brings lasting joy."}
                </Text>
              </View>
            </LinearGradient>
          )}
          
          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!amount || !description || !selectedCategory) && styles.disabledButton
            ]}
            onPress={handleSubmit}
            disabled={!amount || !description || !selectedCategory || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <Text style={styles.submitButtonText}>Add Transaction</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  formContainer: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    paddingVertical: 12,
  },
  textInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  emotionSelection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emotionOption: {
    width: '18%',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  emotionIcon: {
    marginBottom: 4,
  },
  emotionLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  analysisCard: {
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  analysisIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(42, 42, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  analysisContent: {
    flex: 1,
  },
  analysisTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  analysisDescription: {
    fontSize: 12,
    color: '#D0D0D0',
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: '#00f19f',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
});