import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Dimensions,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../utils/helpers';

const { width, height } = Dimensions.get('window');

// Onboarding screen data
const onboardingData = [
  {
    id: '1',
    title: 'Welcome to Lume',
    description: 'Achieve your wellness goals with our AI, personalized to your unique needs.',
    image: require('../../assets/onboarding1.png'),
  },
  {
    id: '2',
    title: 'Personalize Your Health With Smart AI',
    description: 'Achieve your wellness goals with our AI, personalized to your unique needs.',
    image: require('../../assets/onboarding2.png'),
  },
  {
    id: '3',
    title: 'Build Intelligent Finance Insight',
    description: 'Track your salary & finances, receive tailored AI recommendations.',
    image: require('../../assets/onboarding3.png'),
  },
  {
    id: '4',
    title: 'Empathic AI Wellness Chatbot For All',
    description: 'Experience compassionate and personalized care with our AI chatbot.',
    image: require('../../assets/onboarding4.png'),
  },
  {
    id: '5',
    title: 'Intuitive Nutrition & Med Tracker with AI',
    description: 'Easily track your medication & nutrition with the power of AI.',
    image: require('../../assets/onboarding5.png'),
  },
  {
    id: '6',
    title: 'Helpful Resources & Community',
    description: 'Join a community of 2,000+ users dedicated to healthy life and ML.',
    image: require('../../assets/onboarding6.png'),
  },
];

// Individual slide component
const OnboardingItem = ({ item }) => {
  return (
    <View style={styles.slide}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );
};

// Pagination dots
const Paginator = ({ data, currentIndex }) => {
  return (
    <View style={styles.paginationContainer}>
      {data.map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            { backgroundColor: i === currentIndex ? theme.colors.primary : theme.colors.border },
          ]}
        />
      ))}
    </View>
  );
};

// Main onboarding component
const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const navigation = useNavigation();

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNextItem = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      endOnboarding();
    }
  };

  const scrollToPreviousItem = () => {
    if (currentIndex > 0) {
      flatListRef.current.scrollToIndex({ index: currentIndex - 1 });
    }
  };

  const endOnboarding = () => {
    navigation.replace('Auth');
  };

  const skipOnboarding = () => {
    navigation.replace('Auth');
  };

  const isLastItem = currentIndex === onboardingData.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={skipOnboarding}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={onboardingData}
        renderItem={({ item }) => <OnboardingItem item={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={flatListRef}
      />

      <Paginator data={onboardingData} currentIndex={currentIndex} />

      <View style={styles.buttonContainer}>
        {currentIndex > 0 && (
          <TouchableOpacity 
            style={[styles.button, styles.backButton]} 
            onPress={scrollToPreviousItem}
          >
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.button, styles.nextButton]} 
          onPress={scrollToNextItem}
        >
          <Text style={styles.buttonText}>
            {isLastItem ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>

      {isLastItem && (
        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account?</Text>
          <TouchableOpacity onPress={endOnboarding}>
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.dark,
  },
  skipContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    fontSize: 16,
    color: theme.colors.text.muted,
  },
  slide: {
    width,
    height,
    alignItems: 'center',
    paddingTop: height * 0.15,
  },
  image: {
    width: width * 0.8,
    height: height * 0.4,
    resizeMode: 'contain',
  },
  contentContainer: {
    marginTop: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: theme.colors.text.primary,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.text.secondary,
    paddingHorizontal: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
    marginLeft: 'auto',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  signInText: {
    color: theme.colors.text.muted,
    marginRight: 5,
  },
  signInButtonText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default OnboardingScreen;