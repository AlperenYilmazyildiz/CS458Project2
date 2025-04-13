import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthService } from '../services/authService';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from "expo-secure-store";

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [timer, setTimer] = useState(10);
  const navigation = useNavigation();

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  function emailRegexCorrect(email) {
    return emailRegex.test(email);
  }

  const handleLogin = async () => {
  if (!emailRegexCorrect(email)) {
      setError("Email format is incorrect. Email must contain one '@', characters before '@' and after '@'.");
      return;
    }
    try {
      const response = await AuthService.login(email, password);
      if (response.status === 200) {
        const token = response.data;
        const userInfo = {
            username: response.data.username,
            email: response.data.email,
            id: response.data.id,
        };
        // Store the user data using expo-secure-store
        await SecureStore.setItemAsync("userToken", token);
        await SecureStore.setItemAsync("userInfo", JSON.stringify(userInfo));
        Alert.alert("Success", "Login Successful!");
        navigation.navigate('Survey');
        resetLoginState();
      } else {
        setError("Login failed. Wrong email or password.");
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        if (newAttempts >= 5) {
          setIsBlocked(true);
          startTimer();
        }
      }
    } catch (error) {
      console.error("Login Failed:", error);
      setError("Login failed");
    }
  };

  useEffect(() => {
    let interval;
    if (isBlocked && timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      resetLoginState();
    }
    return () => clearInterval(interval);
  }, [isBlocked, timer]);

  const startTimer = () => {
    setIsBlocked(true);
    setTimer(10); // Reset timer to 10 seconds
  };

  const resetLoginState = () => {
    setIsBlocked(false);
    setLoginAttempts(0);
    setTimer(10);
  };


  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>
        
        {error ? <Text style={styles.error}>{error}</Text> : null}
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity
          style={[styles.button, isBlocked && styles.buttonDisabled]}
          onPress={handleLogin}
          accessibilityLabel="login_button"
          disabled={isBlocked}
        >
          <Text style={styles.buttonText}>
            {isBlocked ? `Try again in ${timer} seconds` : 'Login'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.divider}>Or</Text>
        <TouchableOpacity
          style={styles.googleButton}
        >
          <Text style={styles.googleButtonText}>Sign in with Google</Text>
        </TouchableOpacity> 
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: {
    textAlign: 'center',
    marginVertical: 15,
    color: '#4b5563',
  },
  googleButton: {
    backgroundColor: '#4285F4',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
  },
  googleButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  error: {
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 15,
  },
});