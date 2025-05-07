import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Switch,
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

// Profile Setting Item Component
const SettingItem = ({ icon, title, subtitle, onPress, value, toggleOption }) => {
  return (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={toggleOption}
    >
      <View style={styles.settingIconContainer}>
        <Ionicons name={icon} size={20} color="#00f19f" />
      </View>
      
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle ? <Text style={styles.settingSubtitle}>{subtitle}</Text> : null}
      </View>
      
      {toggleOption ? (
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{ false: '#333', true: '#00f19f40' }}
          thumbColor={value ? '#00f19f' : '#f4f3f4'}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#888" />
      )}
    </TouchableOpacity>
  );
};

// Section Header Component
const SectionHeader = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { logout } = useAuth();
  
  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emotionDetectionEnabled, setEmotionDetectionEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  
  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        { 
          text: "Cancel", 
          style: "cancel" 
        },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: () => {
            logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          }
        }
      ]
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>DU</Text>
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Demo User</Text>
              <Text style={styles.profileEmail}>demo@example.com</Text>
              <TouchableOpacity style={styles.editProfileButton}>
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>87</Text>
              <Text style={styles.statLabel}>Emotions Tracked</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>142</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>24</Text>
              <Text style={styles.statLabel}>Insights</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.settingsContainer}>
          <SectionHeader title="App Settings" />
          
          <SettingItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Receive alerts and insights"
            toggleOption={true}
            value={notificationsEnabled}
            onPress={() => setNotificationsEnabled(!notificationsEnabled)}
          />
          
          <SettingItem
            icon="happy-outline"
            title="Emotion Detection"
            subtitle="Enable facial emotion detection"
            toggleOption={true}
            value={emotionDetectionEnabled}
            onPress={() => setEmotionDetectionEnabled(!emotionDetectionEnabled)}
          />
          
          <SettingItem
            icon="moon-outline"
            title="Dark Mode"
            subtitle="Use dark theme"
            toggleOption={true}
            value={darkModeEnabled}
            onPress={() => setDarkModeEnabled(!darkModeEnabled)}
          />
          
          <SectionHeader title="Account" />
          
          <SettingItem
            icon="card-outline"
            title="Connected Accounts"
            subtitle="Manage financial connections"
            onPress={() => Alert.alert("Feature Coming Soon", "This feature will be available in a future update.")}
          />
          
          <SettingItem
            icon="finger-print-outline"
            title="Biometric Authentication"
            subtitle="Use fingerprint or Face ID"
            toggleOption={true}
            value={biometricsEnabled}
            onPress={() => setBiometricsEnabled(!biometricsEnabled)}
          />
          
          <SettingItem
            icon="cloud-download-outline"
            title="Export Your Data"
            subtitle="Download all your stored data"
            onPress={() => Alert.alert("Feature Coming Soon", "This feature will be available in a future update.")}
          />
          
          <SectionHeader title="Support" />
          
          <SettingItem
            icon="help-circle-outline"
            title="Help Center"
            subtitle="View FAQs and tutorials"
            onPress={() => Alert.alert("Feature Coming Soon", "This feature will be available in a future update.")}
          />
          
          <SettingItem
            icon="mail-outline"
            title="Contact Support"
            subtitle="Get help with your account"
            onPress={() => Alert.alert("Feature Coming Soon", "This feature will be available in a future update.")}
          />
          
          <SettingItem
            icon="document-text-outline"
            title="Privacy Policy"
            onPress={() => Alert.alert("Feature Coming Soon", "This feature will be available in a future update.")}
          />
          
          <SettingItem
            icon="information-circle-outline"
            title="About Lume"
            subtitle="Version 1.0.0"
            onPress={() => Alert.alert("Feature Coming Soon", "This feature will be available in a future update.")}
          />
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ff4d4f" />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  profileSection: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 24,
    overflow: 'hidden',
  },
  profileHeader: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#00f19f20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00f19f',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  editProfileButton: {
    alignSelf: 'flex-start',
  },
  editProfileText: {
    color: '#00f19f',
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#333',
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#333',
  },
  settingsContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#121212',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#1e1e1e',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2d2d2d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#fff',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2d2d2d',
    marginHorizontal: 20,
    marginBottom: 40,
    padding: 14,
    borderRadius: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ff4d4f',
    marginLeft: 8,
  },
});