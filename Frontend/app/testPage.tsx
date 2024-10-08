import { Text, View, StyleSheet, TextInput, TouchableOpacity, Pressable } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, getIdToken } from "firebase/auth";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "../firebaseConfig"
import { useSession } from '../ctx';
import { router, Redirect } from 'expo-router';
import { Image } from "expo-image";

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

// Django Endpoint for user registration POST request
const REGISTER_URL = 'http://127.0.0.1:8000/users/register/';

// Firebase Authentication sections based on the code provided in Firebase's sign up new users guide
// https://firebase.google.com/docs/auth/web/start

export default function RegistrationForm() {
  const { session, isLoading, signIn } = useSession();  
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (data: {email: string; password: string}) => {
    setMessage('');
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email,
        data.password);
      const user = userCredential.user;
      // Get Firebase ID token
      const token = await user.getIdToken();
      // Sign in occurs if once firebase authenticates for now because everyone does not have django backend set up yet
      // Move signIn() and router.replace lines in if(response.ok) statement at a later time
      if (user) {
        signIn(user.uid, token)
        router.replace('/dashboard');
      }

      const response = await fetch(REGISTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid: user.uid, email: data.email }),
      });

      if (response.ok) {
        const responseData = await response.json();
        setMessage('Registration successful!');
        await AsyncStorage.setItem('user', JSON.stringify(responseData));
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (firebaseError) {
      if (firebaseError instanceof Error) {
        setError(firebaseError.message);
      } else {
        setError('An unkown error occurred.');
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

  const [avatar, setAvatar] = useState<string>()

  return (
    <View style={styles.container}>

      <Text>Select an Avatar</Text>
      <View style={styles.imageContainer}>
        <Pressable onPress={() => setAvatar("209587.jpg")}>
          <Image
            style={avatar === "209587.jpg" ? styles.selectedImage : styles.image}
            source="../assets/avatars/2095387.jpg"
            contentFit="contain"
          />
        </Pressable>
        <Pressable onPress={() => setAvatar("2095388.jpg")}>
          <Image
            style={avatar === "2095388.jpg" ? styles.selectedImage : styles.image}
            source="../assets/avatars/2095388.jpg"
            contentFit="contain"
          />
        </Pressable>
        <Pressable onPress={() => setAvatar("2095389.jpg")}>
          <Image
            style={avatar === "2095389.jpg" ? styles.selectedImage : styles.image}
            source="../assets/avatars/2095389.jpg"
            contentFit="contain"
          />
        </Pressable>
        <Pressable onPress={() => setAvatar("2095391.jpg")}>
          <Image
            style={avatar === "2095391.jpg" ? styles.selectedImage : styles.image}
            source="../assets/avatars/2095391.jpg"
            contentFit="contain"
          />
        </Pressable>
        <Pressable onPress={() => setAvatar("2095392.jpg")}>
          <Image
            style={avatar === "2095392.jpg" ? styles.selectedImage : styles.image}
            source="../assets/avatars/2095392.jpg"
            contentFit="contain"
          />
        </Pressable>
        <Pressable onPress={() => setAvatar("2095393.jpg")}>
          <Image
            style={avatar === "2095393.jpg" ? styles.selectedImage : styles.image}
            source="../assets/avatars/2095393.jpg"
            contentFit="contain"
          />
        </Pressable>
      </View>
      <View style={styles.imageContainer}>
        <Pressable onPress={() => setAvatar("5937550.jpg")}>
         <Image
            style={avatar === "5937550.jpg" ? styles.selectedImage : styles.image}
            source="../assets/avatars/5937550.jpg"
            contentFit="contain"
          />
        </Pressable>
        <Pressable onPress={() => setAvatar("5937551.jpg")}>
         <Image
            style={avatar === "5937551.jpg" ? styles.selectedImage : styles.image}
            source="../assets/avatars/5937551.jpg"
            contentFit="contain"
          />
        </Pressable>
        <Pressable onPress={() => setAvatar("5937552.jpg")}>
         <Image
            style={avatar === "5937552.jpg" ? styles.selectedImage : styles.image}
            source="../assets/avatars/5937552.jpg"
            contentFit="contain"
          />
        </Pressable>
        <Pressable onPress={() => setAvatar("5937553.jpg")}>
          <Image
            style={avatar === "5937553.jpg" ? styles.selectedImage : styles.image}
            source="../assets/avatars/5937553.jpg"
            contentFit="contain"
          />
        </Pressable>
        <Pressable onPress={() => setAvatar("5937554.jpg")}>
          <Image
            style={avatar === "5937554.jpg" ? styles.selectedImage : styles.image}
            source="../assets/avatars/5937554.jpg"
            contentFit="contain"
          />
        </Pressable>
        <Pressable onPress={() => setAvatar("5937555.jpg")}>
         <Image
            style={avatar === "5937555.jpg" ? styles.selectedImage : styles.image}
            source="../assets/avatars/5937555.jpg"
            contentFit="contain"
          />
        </Pressable>
        <Pressable onPress={() => setAvatar("5937556.jpg")}>
          <Image
            style={avatar === "5937556.jpg" ? styles.selectedImage : styles.image}
            source="../assets/avatars/5937556.jpg"
            contentFit="contain"
          />
        </Pressable>
        <Pressable onPress={() => setAvatar("5937557.jpg")}>
          <Image
            style={avatar === "5937557.jpg" ? styles.selectedImage : styles.image}
            source="../assets/avatars/5937557.jpg"
            contentFit="contain"
          />
        </Pressable>
        <Pressable onPress={() => setAvatar("5937558.jpg")}>
          <Image
            style={avatar === "5937558.jpg" ? styles.selectedImage : styles.image}
            source="../assets/avatars/5937558.jpg"
            contentFit="contain"
          />
        </Pressable>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
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
  imageContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  image: {
    margin: 10,
    width: 100,
    height: 100
  },
  selectedImage: {
    borderColor: colors.darkGreen,
    borderWidth: 5,
    margin: 10,
    width: 100,
    height: 100
  },
})
