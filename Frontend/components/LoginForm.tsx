import { Text, View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useForm, Controller } from "react-hook-form";
import auth from "../firebaseConfig"
import { useSession } from '../ctx';
import { router, Redirect } from 'expo-router';
import { signInWithEmailAndPassword, getIdToken } from "firebase/auth";
import { firebase } from "@react-native-firebase/auth";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const colors = {
  // Theme
  lightGreen: '#50C878',
  mediumGreen: '#3f9d5e',
  darkGreen: '#1d482b',

  // Other colors
  orange: '#FFA500', // Chest & Triceps day
  blue: '#0096FF', // Back & Biceps day
  red: '#EE4B2B', // Leg day
  purple: '#800080', // Cardio day
  lightGray: '#E3E3E3', // Section rectangle
  darkGray: '#BDBDBD', // Text bubble & Progress bar
  white: '#ffffff',
  black: '#000000'
}

// Django Endpoint for user login POST request
const LOGIN_URL = 'http://127.0.0.1:8000/users/login/';

// Firebase Authentication sections based on the code provided in Firebase's sign in existing users guide
// https://firebase.google.com/docs/auth/web/start

export default function LoginForm() {
  const { session, isLoading, signIn } = useSession();
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (data: {email: string; password: string }) => {
    setMessage('');
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      // Get Firebase ID token
      const token = await user.getIdToken();
      console.log(token)
      // Sign in occurs if once firebase authenticates for now because everyone does not have django backend set up yet
      // Move signIn() and router.replace lines in if(response.ok) statement at a later time
      if (user) {
        // Sign in the user and store the user ID and user token with the authentication context so it can be retreived anywhere within the app
        signIn(user.uid, token)
        router.replace('/dashboard');
      }
      // Send firebase token to Django.
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ uid: user.uid, email: data.email }),
      });

      if (response.ok) {
        const responseData = await response.json();
        setMessage('Login successful!');
        await AsyncStorage.setItem('user', JSON.stringify(responseData));
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (firebaseError) {
      if (firebaseError instanceof Error) {
        setError(firebaseError.message);
      } else {
        setError('An unknown error occurred.');
      }
    }
  };

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/dashboard" />;
  }

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Log In</Text>

      {message ? <Text style={styles.success}>{message}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Controller
        control={control}
        rules={{
         required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="Email"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            style={styles.input}
            autoComplete="email"
          />
        )}
        name="email"
      />
      {errors.email && <Text style={styles.bodyText}>Please enter a valid email address.</Text>}

      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="Password"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            style={styles.input}
            autoComplete="current-password"
            secureTextEntry={true}
          />
        )}
        name="password"
      />
      {errors.password && <Text style={styles.bodyText}>Please enter your password.</Text>}

      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      {/*Temporary way to bypass login during development*/}
      <Text
        onPress={() => {
          signIn("BYPASS_UID", "BYPASS_TOKEN")
          router.replace('/dashboard')
        }}
        style={{
          color: 'red',
          fontSize: 20,
          textDecorationLine: 'underline'
        }}>
        PRESS HERE TO BYPASS LOGIN
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  button: {
    backgroundColor: colors.darkGreen,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 45,
    margin: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: colors.lightGray,
    fontSize: 24,
    margin: 15,
    padding: 10,
    borderRadius: 10
  },
  bodyText: {
    fontSize: 16,
    margin: 15
  },
  title: {
    fontSize: 36,
    padding: 10,
    margin: 30,
    fontWeight: 'bold'
  },
  success: {
    color: 'green',
    fontSize: 16,
    margin: 15,
  },
  error: {
    color: 'red',
    fontSize: 16,
    margin: 15,
  },
})
