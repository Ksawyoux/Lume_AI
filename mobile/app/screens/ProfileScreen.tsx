import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emotionTrackingEnabled, setEmotionTrackingEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  
  // User data
  const user = {
    id: 1,
    name: 'Youness Sadik',
    email: 'youness@example.com',
    initials: 'YS',
    joinDate: 'May 2025',
    healthDataSources: ['Apple Watch', 'WHOOP Band'],
  };
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };
  
  const toggleEmotionTracking = () => {
    if (emotionTrackingEnabled) {
      Alert.alert(
        "Disable Emotion Tracking?",
        "This will limit personalized financial insights based on your emotional patterns.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Disable", style: "destructive", onPress: () => setEmotionTrackingEnabled(false) }
        ]
      );
    } else {
      setEmotionTrackingEnabled(true);
    }
  };
  
  const toggleBiometrics = () => {
    setBiometricsEnabled(!biometricsEnabled);
  };
  
  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: () => console.log("User logged out") }
      ]
    );
  };
  
  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: 'person-outline', label: 'Personal Information', action: () => {} },
        { icon: 'card-outline', label: 'Payment Methods', action: () => {} },
        { icon: 'notifications-outline', label: 'Notifications', action: () => {}, toggle: true, value: notificationsEnabled, onToggle: toggleNotifications },
      ]
    },
    {
      title: 'Privacy & Security',
      items: [
        { icon: 'lock-closed-outline', label: 'Change Password', action: () => {} },
        { icon: 'finger-print', label: 'Biometric Authentication', action: () => {}, toggle: true, value: biometricsEnabled, onToggle: toggleBiometrics },
        { icon: 'happy-outline', label: 'Emotion Tracking', action: () => {}, toggle: true, value: emotionTrackingEnabled, onToggle: toggleEmotionTracking },
        { icon: 'shield-checkmark-outline', label: 'Data Permissions', action: () => {} },
      ]
    },
    {
      title: 'Appearance',
      items: [
        { icon: 'moon-outline', label: 'Dark Mode', action: () => {}, toggle: true, value: isDarkMode, onToggle: toggleDarkMode },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle-outline', label: 'Help Center', action: () => {} },
        { icon: 'chatbubble-outline', label: 'Contact Support', action: () => {} },
        { icon: 'document-text-outline', label: 'Terms & Privacy', action: () => {} },
      ]
    },
  ];
  
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>Manage your account</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="person" size={20} color="#00f19f" />
        </View>
      </View>
      
      {/* Profile Card */}
      <LinearGradient
        colors={['#2A363D', '#1A2125']}
        style={styles.profileCard}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{user.initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
            <Text style={styles.profileMember}>Member since {user.joinDate}</Text>
          </View>
        </View>
        
        <View style={styles.profileActions}>
          <TouchableOpacity style={styles.profileAction}>
            <Ionicons name="pencil" size={16} color="#00f19f" />
            <Text style={styles.profileActionText}>Edit</Text>
          </TouchableOpacity>
          
          <View style={styles.profileDivider} />
          
          <TouchableOpacity style={styles.profileAction}>
            <Ionicons name="cloud-download-outline" size={16} color="#00f19f" />
            <Text style={styles.profileActionText}>Export Data</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
      
      {/* Health Data Sources */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Connected Health Sources</Text>
        <LinearGradient
          colors={['#2A363D', '#1A2125']}
          style={styles.healthCard}
        >
          {user.healthDataSources.map((source, index) => (
            <View key={index} style={styles.healthSource}>
              <View style={styles.healthSourceIcon}>
                <Ionicons 
                  name={source.includes('Apple') ? 'logo-apple' : 'fitness'} 
                  size={18} 
                  color="#FFFFFF" 
                />
              </View>
              <Text style={styles.healthSourceText}>{source}</Text>
              <View style={styles.connectedIndicator}>
                <Ionicons name="checkmark-circle" size={16} color="#00f19f" />
                <Text style={styles.connectedText}>Connected</Text>
              </View>
            </View>
          ))}
          
          <TouchableOpacity style={styles.addSourceButton}>
            <Ionicons name="add-circle-outline" size={18} color="#00f19f" />
            <Text style={styles.addSourceText}>Add New Health Source</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
      
      {/* Menu Sections */}
      {menuSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <LinearGradient
            colors={['#2A363D', '#1A2125']}
            style={styles.menuCard}
          >
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity 
                key={itemIndex} 
                style={[
                  styles.menuItem,
                  itemIndex < section.items.length - 1 && styles.menuItemBorder
                ]}
                onPress={item.action}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name={item.icon as any} size={20} color="#00f19f" style={styles.menuItemIcon} />
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                </View>
                
                {item.toggle ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{ false: '#3A3A3A', true: 'rgba(0, 241, 159, 0.3)' }}
                    thumbColor={item.value ? '#00f19f' : '#F4F3F4'}
                  />
                ) : (
                  <Ionicons name="chevron-forward" size={18} color="#8E8E93" />
                )}
              </TouchableOpacity>
            ))}
          </LinearGradient>
        </View>
      ))}
      
      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#FF5252" style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
      
      {/* Version */}
      <Text style={styles.versionText}>Lume v1.0.0</Text>
      
      {/* Empty space at bottom for navigation safety */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

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
  profileCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3A3A3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: '#D0D0D0',
    marginBottom: 2,
  },
  profileMember: {
    fontSize: 12,
    color: '#8E8E93',
  },
  profileActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  profileAction: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileActionText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 6,
  },
  profileDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  healthCard: {
    borderRadius: 16,
    padding: 16,
  },
  healthSource: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  healthSourceIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3A3A3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  healthSourceText: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  connectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectedText: {
    fontSize: 12,
    color: '#00f19f',
    marginLeft: 4,
  },
  addSourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 4,
  },
  addSourceText: {
    fontSize: 14,
    color: '#00f19f',
    marginLeft: 6,
  },
  menuCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    marginRight: 12,
  },
  menuItemLabel: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 20,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF5252',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 20,
  },
});