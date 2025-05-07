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

// Import SVG components
import { SvgXml } from 'react-native-svg';

// SVG strings - normally these would be imported from files
const svg1 = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="none" />
  <circle cx="150" cy="150" r="60" fill="#00f19f" opacity="0.2" />
  <circle cx="150" cy="150" r="30" fill="#00f19f" />
  <!-- Stylized person icon -->
  <g transform="translate(120, 130) scale(0.8)">
    <circle cx="40" cy="25" r="20" fill="#00f19f" opacity="0.8" />
    <rect x="30" y="50" width="20" height="40" rx="10" fill="#00f19f" opacity="0.8" />
    <rect x="20" y="60" width="15" height="30" rx="7" fill="#00f19f" opacity="0.7" transform="rotate(-30, 20, 60)" />
    <rect x="45" y="60" width="15" height="30" rx="7" fill="#00f19f" opacity="0.7" transform="rotate(30, 45, 60)" />
    <rect x="30" y="90" width="10" height="30" rx="5" fill="#00f19f" opacity="0.7" transform="rotate(-15, 30, 90)" />
    <rect x="40" y="90" width="10" height="30" rx="5" fill="#00f19f" opacity="0.7" transform="rotate(15, 40, 90)" />
  </g>
</svg>`;

const svg2 = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="none" />
  <circle cx="150" cy="150" r="60" fill="#0066ff" opacity="0.2" />
  
  <!-- Health icon with stethoscope -->
  <g transform="translate(100, 100)">
    <circle cx="50" cy="50" r="40" fill="#0066ff" opacity="0.3" />
    <path d="M30,50 C30,30 70,30 70,50 C70,70 50,80 50,90 L50,110" stroke="#0066ff" stroke-width="8" fill="none" />
    <circle cx="50" cy="120" r="10" fill="#0066ff" />
    <circle cx="20" cy="30" r="15" fill="#0066ff" />
    <circle cx="80" cy="30" r="15" fill="#0066ff" />
  </g>
</svg>`;

const svg3 = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="none" />
  <circle cx="150" cy="150" r="60" fill="#ff5a5f" opacity="0.2" />
  
  <!-- Finance icon with chart and coins -->
  <g transform="translate(100, 90)">
    <rect x="10" y="60" width="20" height="40" fill="#ff5a5f" />
    <rect x="40" y="40" width="20" height="60" fill="#ff5a5f" />
    <rect x="70" y="20" width="20" height="80" fill="#ff5a5f" />
    
    <!-- Money coin -->
    <circle cx="30" cy="30" r="20" fill="#ff5a5f" opacity="0.8" />
    <text x="30" y="35" text-anchor="middle" font-family="Arial" font-size="20" fill="white">$</text>
    
    <!-- Money coin -->
    <circle cx="70" cy="35" r="15" fill="#ff5a5f" opacity="0.7" />
    <text x="70" y="40" text-anchor="middle" font-family="Arial" font-size="16" fill="white">$</text>
  </g>
</svg>`;

const svg4 = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="none" />
  <circle cx="150" cy="150" r="60" fill="#9c9c9c" opacity="0.2" />
  
  <!-- AI Chatbot -->
  <g transform="translate(100, 80)">
    <!-- Robot head -->
    <rect x="20" y="20" width="60" height="60" rx="10" fill="#9c9c9c" />
    
    <!-- Robot eyes -->
    <circle cx="40" cy="40" r="8" fill="white" />
    <circle cx="60" cy="40" r="8" fill="white" />
    <circle cx="40" cy="40" r="4" fill="#00f19f" />
    <circle cx="60" cy="40" r="4" fill="#00f19f" />
    
    <!-- Robot antenna -->
    <rect x="45" y="10" width="10" height="10" fill="#9c9c9c" />
    <circle cx="50" cy="5" r="5" fill="#00f19f" />
    
    <!-- Robot mouth -->
    <rect x="35" y="60" width="30" height="5" rx="2" fill="white" />
    
    <!-- Chat bubbles -->
    <circle cx="100" cy="30" r="15" fill="#9c9c9c" opacity="0.5" />
    <circle cx="110" cy="60" r="10" fill="#9c9c9c" opacity="0.5" />
    <circle cx="95" cy="80" r="8" fill="#9c9c9c" opacity="0.5" />
  </g>
</svg>`;

const svg5 = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="none" />
  <circle cx="150" cy="150" r="60" fill="#b94df3" opacity="0.2" />
  
  <!-- Nutrition and Medication Tracking -->
  <g transform="translate(90, 80)">
    <!-- Plate with food -->
    <circle cx="60" cy="50" r="35" fill="#b94df3" opacity="0.2" />
    <circle cx="60" cy="50" r="30" fill="white" opacity="0.5" />
    
    <!-- Food items -->
    <rect x="40" y="40" width="12" height="12" rx="2" fill="#b94df3" />
    <circle cx="65" cy="45" r="8" fill="#b94df3" opacity="0.7" />
    <rect x="70" y="55" width="15" height="8" rx="4" fill="#b94df3" opacity="0.7" />
    <rect x="45" y="60" width="10" height="10" rx="2" fill="#b94df3" opacity="0.6" />
    
    <!-- Pill bottle -->
    <rect x="100" y="35" width="20" height="35" rx="5" fill="#b94df3" opacity="0.8" />
    <rect x="100" y="30" width="20" height="5" rx="2" fill="#b94df3" />
    <circle cx="110" cy="45" r="5" fill="white" opacity="0.7" />
    <circle cx="110" cy="60" r="5" fill="white" opacity="0.7" />
  </g>
</svg>`;

const svg6 = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="none" />
  <circle cx="150" cy="150" r="60" fill="#00c3b2" opacity="0.2" />
  
  <!-- Community and Resources -->
  <g transform="translate(90, 80)">
    <!-- Community people -->
    <circle cx="40" cy="40" r="15" fill="#00c3b2" opacity="0.7" />
    <circle cx="80" cy="40" r="15" fill="#00c3b2" opacity="0.9" />
    <circle cx="60" cy="70" r="15" fill="#00c3b2" opacity="0.8" />
    <circle cx="30" cy="70" r="12" fill="#00c3b2" opacity="0.6" />
    <circle cx="90" cy="70" r="12" fill="#00c3b2" opacity="0.6" />
    
    <!-- Connection lines -->
    <line x1="40" y1="40" x2="80" y2="40" stroke="#00c3b2" stroke-width="2" />
    <line x1="40" y1="40" x2="60" y2="70" stroke="#00c3b2" stroke-width="2" />
    <line x1="80" y1="40" x2="60" y2="70" stroke="#00c3b2" stroke-width="2" />
    <line x1="30" y1="70" x2="60" y2="70" stroke="#00c3b2" stroke-width="2" />
    <line x1="90" y1="70" x2="60" y2="70" stroke="#00c3b2" stroke-width="2" />
    
    <!-- Sparkles -->
    <path d="M120,30 L125,40 L135,45 L125,50 L120,60 L115,50 L105,45 L115,40 Z" fill="#00c3b2" />
    <path d="M110,80 L113,86 L120,89 L113,92 L110,98 L107,92 L100,89 L107,86 Z" fill="#00c3b2" opacity="0.8" />
  </g>
</svg>`;

// Onboarding screen data
const onboardingData = [
  {
    id: '1',
    title: 'Welcome to Lume',
    description: 'Achieve your wellness goals with our AI, personalized to your unique needs.',
    svgString: svg1,
  },
  {
    id: '2',
    title: 'Personalize Your Health With Smart AI',
    description: 'Achieve your wellness goals with our AI, personalized to your unique needs.',
    svgString: svg2,
  },
  {
    id: '3',
    title: 'Build Intelligent Finance Insight',
    description: 'Track your salary & finances, receive tailored AI recommendations.',
    svgString: svg3,
  },
  {
    id: '4',
    title: 'Empathic AI Wellness Chatbot For All',
    description: 'Experience compassionate and personalized care with our AI chatbot.',
    svgString: svg4,
  },
  {
    id: '5',
    title: 'Intuitive Nutrition & Med Tracker with AI',
    description: 'Easily track your medication & nutrition with the power of AI.',
    svgString: svg5,
  },
  {
    id: '6',
    title: 'Helpful Resources & Community',
    description: 'Join a community of 2,000+ users dedicated to healthy life and ML.',
    svgString: svg6,
  },
];

// Individual slide component
const OnboardingItem = ({ item }) => {
  return (
    <View style={styles.slide}>
      <View style={styles.imageContainer}>
        <SvgXml xml={item.svgString} width={width * 0.8} height={height * 0.4} />
      </View>
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
  imageContainer: {
    width: width * 0.8,
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
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