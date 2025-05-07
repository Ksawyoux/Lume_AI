import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  View, 
  SafeAreaView, 
  Platform,
  UIManager
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { 
  Ionicons, 
  FontAwesome5, 
  MaterialCommunityIcons 
} from '@expo/vector-icons';

// Import screens
import HomeScreen from './app/screens/HomeScreen';
import HealthScreen from './app/screens/HealthScreen';
import EmotionsScreen from './app/screens/EmotionsScreen';
import InsightsScreen from './app/screens/InsightsScreen';
import ProfileScreen from './app/screens/ProfileScreen';
import AddTransactionScreen from './app/screens/AddTransactionScreen';

// Setup for React Native animations
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// Navigation types
type BottomTabParamList = {
  Home: undefined;
  Health: undefined;
  AddTransaction: undefined;
  Emotions: undefined;
  Insights: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();
const Stack = createNativeStackNavigator();

// Custom header component with the recovery score
const RecoveryHeader = () => {
  const [recoveryScore, setRecoveryScore] = useState(87);
  const [change, setChange] = useState('+15');

  useEffect(() => {
    // In a real app, we would fetch this data from an API or local storage
    // This is just a placeholder
  }, []);

  return (
    <View style={styles.headerContainer}>
      <View style={styles.logoContainer}>
        <Ionicons name="flash" size={24} color="#00f19f" />
        <Text style={styles.logoText}>LUME</Text>
      </View>
      
      <View style={styles.recoveryContainer}>
        <Text style={styles.recoveryPercentage}>{recoveryScore}% <Text style={styles.recoveryChange}>{change}</Text></Text>
        <Text style={styles.recoveryLabel}>RECOVERY</Text>
      </View>
      
      <View style={styles.iconsContainer}>
        <Ionicons name="notifications-outline" size={24} color="#fff" style={styles.icon} />
        <Ionicons name="settings-outline" size={24} color="#fff" style={styles.icon} />
        <View style={styles.profileIcon}>
          <Text style={styles.profileInitials}>YS</Text>
        </View>
      </View>
    </View>
  );
};

// Tab Navigator with custom styling
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#00f19f',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') {
            return <Ionicons name="home" size={size} color={color} />;
          } else if (route.name === 'Health') {
            return <Ionicons name="heart" size={size} color={color} />;
          } else if (route.name === 'AddTransaction') {
            return (
              <View style={styles.addButton}>
                <Ionicons name="add" size={30} color="#000" />
              </View>
            );
          } else if (route.name === 'Emotions') {
            return <MaterialCommunityIcons name="emoticon" size={size} color={color} />;
          } else if (route.name === 'Insights') {
            return <Ionicons name="bar-chart" size={size} color={color} />;
          } else if (route.name === 'Profile') {
            return <FontAwesome5 name="user" size={size - 2} color={color} />;
          }
          return null;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Health" component={HealthScreen} />
      <Tab.Screen 
        name="AddTransaction" 
        component={AddTransactionScreen}
        options={{
          tabBarLabel: '',
        }}
      />
      <Tab.Screen name="Emotions" component={EmotionsScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <SafeAreaView style={styles.container}>
        <RecoveryHeader />
        <TabNavigator />
        <StatusBar style="light" />
      </SafeAreaView>
    </NavigationContainer>
  );
}

// Styles for the app
import { Text } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  recoveryContainer: {
    alignItems: 'center',
  },
  recoveryPercentage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00f19f',
  },
  recoveryChange: {
    fontSize: 16,
    color: '#00f19f',
  },
  recoveryLabel: {
    fontSize: 12,
    color: '#8E8E93',
    letterSpacing: 1,
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginHorizontal: 8,
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  profileInitials: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tabBar: {
    backgroundColor: '#121212',
    borderTopColor: '#2A2A2A',
    height: 60,
    paddingBottom: 5,
  },
  tabBarLabel: {
    fontSize: 10,
  },
  addButton: {
    backgroundColor: '#00f19f',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
});