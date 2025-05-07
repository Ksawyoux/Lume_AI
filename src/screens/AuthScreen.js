import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigation = useNavigation();
  const { login, register } = useAuth();
  
  const handleAuth = async () => {
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        // For demo purposes, using a simple email/password check
        if (email === 'demo@example.com' && password === 'password') {
          await login({ email, name: 'Demo User' });
          navigation.navigate('Main');
        } else {
          setError('Invalid credentials. Try demo@example.com / password');
        }
      } else {
        // Registration would typically connect to a backend
        if (!name || !email || !password) {
          setError('Please fill all fields');
        } else if (password.length < 6) {
          setError('Password must be at least 6 characters');
        } else {
          await register({ email, name });
          navigation.navigate('Main');
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Lume</Text>
            <Text style={styles.subtitle}>Where emotions meet finances</Text>
          </View>
          
          <View style={styles.formContainer}>
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, isLogin && styles.activeTab]} 
                onPress={() => setIsLogin(true)}
              >
                <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, !isLogin && styles.activeTab]} 
                onPress={() => setIsLogin(false)}
              >
                <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Register</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{isLogin ? 'Welcome back' : 'Create an account'}</Text>
              <Text style={styles.cardSubtitle}>
                {isLogin 
                  ? 'Enter your credentials to access your account' 
                  : 'Enter your details to get started'}
              </Text>
              
              {!isLogin && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="John Doe"
                    placeholderTextColor="#666"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              )}
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor="#666"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
              
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              
              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleAuth}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading 
                    ? isLogin ? 'Signing in...' : 'Creating account...' 
                    : isLogin ? 'Sign in' : 'Create account'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.linkButton} 
                onPress={() => setIsLogin(!isLogin)}
              >
                <Text style={styles.linkText}>
                  {isLogin 
                    ? "Don't have an account? Create one" 
                    : 'Already have an account? Sign in'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.features}>
            <Text style={styles.featuresTitle}>Track your emotions, transform your finances</Text>
            <Text style={styles.featuresSubtitle}>
              Lume helps you understand how your emotional states influence your financial decisions,
              providing personalized insights for better financial well-being.
            </Text>
            
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureIconText}>1</Text>
                </View>
                <Text style={styles.featureTitle}>Track emotions</Text>
                <Text style={styles.featureDescription}>Record and analyze your emotional states</Text>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureIconText}>2</Text>
                </View>
                <Text style={styles.featureTitle}>Connect finances</Text>
                <Text style={styles.featureDescription}>Link your financial data securely</Text>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureIconText}>3</Text>
                </View>
                <Text style={styles.featureTitle}>Gain insights</Text>
                <Text style={styles.featureDescription}>Get personalized recommendations</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1e1e1e',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#2d2d2d',
  },
  tabText: {
    color: '#888',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ccc',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#2d2d2d',
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#444',
  },
  errorText: {
    color: '#ff4d4f',
    marginTop: 8,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#00f19f',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#121212',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#00f19f',
    fontSize: 14,
  },
  features: {
    padding: 20,
    marginTop: 20,
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  featuresSubtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  featuresList: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  featureItem: {
    alignItems: 'center',
    marginBottom: 30,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 241, 159, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureIconText: {
    color: '#00f19f',
    fontWeight: 'bold',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});