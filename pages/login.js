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
import jwtDecode from 'jwt-decode';
// import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from "expo-secure-store";
//import { GoogleSignin, isSuccessResponse, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';

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

  // const [request, response, promptAsync] = Google.useAuthRequest({
  //   webClientId: '920285886677-sdrd539vgvciuk4tu3q6okggvvdad963.apps.googleusercontent.com',
  //   iosClientId: '920285886677-1obbrajonkjed0thdvkj0l3t5ehn67p7.apps.googleusercontent.com',
  // });

 


  // useEffect(() => {
  //   if (response?.type === 'success') {
  //     const { authentication } = response;
  //     // Use authentication.accessToken to get user info
  //     fetchUserInfo(authentication.accessToken);
  //   }
  // }, [response]);

  // const fetchUserInfo = async (token) => {
  //   const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
  //     headers: { Authorization: `Bearer ${token}` },
  //   });
  //   const userInfo = await response.json();
  //   console.log(userInfo);
  //   // Handle user info (email, name, etc.)
  // };


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

  // const handleGoogleLogin = async () => {
  //   try {
  //     await GoogleSignin.hasPlayServices();
  //     const response = await GoogleSignin.signIn(); 
  //     if( isSuccessResponse(response) ){
  //       const { idToken, user } = response.data;
  //       const { name, email } = user;
  //       const userToken = jwtDecode(idToken);
  //       navigation.navigate('Survey');
  //     }
  //     else{
  //       setError("Google login cancelled.");
  //     }
  //     // await GoogleSignin.hasPlayServices();
  //     // const userInfo = await GoogleSignin.signIn();
  //     // const decoded = jwtDecode(userInfo.idToken);
      
  //     // const response = await AuthService.checkExistingUser(decoded.email);
  //     // const data = await response.json();
      
  //     // if (data) {
  //     //   Alert.alert("Error", `User with email ${decoded.email} already exists.`);
  //     //   setError("Google login failed. Please try again.");
  //     // } else {
  //     //   Alert.alert("Success", "Google Login Successful!");
  //     //   navigation.navigate('Survey');
  //     // }

  //   } catch (error) {
  //     if( isErrorWithCode(error, statusCodes.SIGN_IN_CANCELLED) ){
  //       setError("Google login cancelled.");
  //     }
  //     else if( isErrorWithCode(error, statusCodes.IN_PROGRESS) ){
  //       setError("Google login in progress.");
  //     }
  //     else if( isErrorWithCode(error, statusCodes.PLAY_SERVICES_NOT_AVAILABLE) ){
  //       setError("Google Play Services not available.");
  //     }
  //     else{
  //       setError("Google login failed. Please try again.");
  //     }
  //     // if (error.code === statusCodes.SIGN_IN_CANCELLED) {
  //     //   // user cancelled the login flow
  //     // } else if (error.code === statusCodes.IN_PROGRESS) {
  //     //   // operation (e.g. sign in) is in progress already
  //     // } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
  //     //   // play services not available or outdated
  //     // } else {
  //     //   console.error("Google login failed", error);
  //     //   setError("Google login failed. Please try again.");
  //     // }
  //   }
  // };

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
          disabled={isBlocked}
        >
          <Text style={styles.buttonText}>
            {isBlocked ? `Try again in ${timer} seconds` : 'Login'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.divider}>Or</Text>
        
        
      </View>
    </View>
  );
}

{/* <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleLogin}
          disabled={!request}
        >
          <Text style={styles.googleButtonText}>Sign in with Google</Text>
        </TouchableOpacity> */}

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