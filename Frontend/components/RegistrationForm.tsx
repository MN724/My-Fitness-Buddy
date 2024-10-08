import { Text, View, StyleSheet, TextInput, TouchableOpacity, Pressable, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, getIdToken } from "firebase/auth";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "../firebaseConfig"
import { useSession } from '../ctx';
import { router, Redirect } from 'expo-router';
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";

const imagePath2095387 = require("../assets/avatars/2095387.jpg")
const imagePath2095388 = require("../assets/avatars/2095388.jpg")
const imagePath2095389 = require("../assets/avatars/2095389.jpg")
const imagePath2095391 = require("../assets/avatars/2095391.jpg")
const imagePath2095392 = require("../assets/avatars/2095392.jpg")
const imagePath2095393 = require("../assets/avatars/2095393.jpg")
const imagePath5937550 = require("../assets/avatars/5937550.jpg")
const imagePath5937551 = require("../assets/avatars/5937551.jpg")
const imagePath5937552 = require("../assets/avatars/5937552.jpg")
const imagePath5937553 = require("../assets/avatars/5937553.jpg")
const imagePath5937554 = require("../assets/avatars/5937554.jpg")
const imagePath5937555 = require("../assets/avatars/5937555.jpg")
const imagePath5937556 = require("../assets/avatars/5937556.jpg")
const imagePath5937557 = require("../assets/avatars/5937557.jpg")
const imagePath5937558 = require("../assets/avatars/5937558.jpg")

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
  const [avatar, setAvatar] = useState<string>()
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      displayName: '',
      email: '',
      password: ''
    }
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (data: {displayName: string, email: string; password: string}) => {
    setMessage('');
    setError('');

    console.log(JSON.stringify({ uid: "FAKE USER ID", email: data.email, display_name: data.displayName, avatar_name: avatar}))

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
        body: JSON.stringify({ uid: user.uid, email: data.email, display_name: data.displayName, avatar_name: avatar}),
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

  return (
    <SafeAreaView style={styles.container}>
    <ScrollView>
      <View style={styles.container}>

        <Text style={styles.title}>Create an Account</Text>

        {message ? <Text style={styles.success}>{message}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Controller
          control={control}
          rules={{
          required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Display Name"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              style={styles.input}
              autoComplete="name"
            />
          )}
          name="displayName"
        />
        {errors.displayName && <Text style={styles.bodyText}>Please enter a valid email address.</Text>}

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

        <Text style={styles.subTitleText}>Select an Avatar</Text>
        <View style={styles.imageContainer}>
          <Pressable onPress={() => setAvatar("209587.jpg")}>
            <Image
              style={avatar === "209587.jpg" ? styles.selectedImage : styles.image}
              source={imagePath2095387}
              contentFit="contain"
            />
          </Pressable>
          <Pressable onPress={() => setAvatar("2095388.jpg")}>
            <Image
              style={avatar === "2095388.jpg" ? styles.selectedImage : styles.image}
              source={imagePath2095388}
              contentFit="contain"
            />
          </Pressable>
          <Pressable onPress={() => setAvatar("2095389.jpg")}>
            <Image
              style={avatar === "2095389.jpg" ? styles.selectedImage : styles.image}
              source={imagePath2095389}
              contentFit="contain"
            />
          </Pressable>
          <Pressable onPress={() => setAvatar("2095391.jpg")}>
            <Image
              style={avatar === "2095391.jpg" ? styles.selectedImage : styles.image}
              source={imagePath2095391}
              contentFit="contain"
            />
          </Pressable>
          <Pressable onPress={() => setAvatar("2095392.jpg")}>
            <Image
              style={avatar === "2095392.jpg" ? styles.selectedImage : styles.image}
              source={imagePath2095392}
              contentFit="contain"
            />
          </Pressable>
          <Pressable onPress={() => setAvatar("2095393.jpg")}>
            <Image
              style={avatar === "2095393.jpg" ? styles.selectedImage : styles.image}
              source={imagePath2095393}
              contentFit="contain"
            />
          </Pressable>
        </View>
        <View style={styles.imageContainer}>
          <Pressable onPress={() => setAvatar("5937550.jpg")}>
          <Image
              style={avatar === "5937550.jpg" ? styles.selectedImage : styles.image}
              source={imagePath5937550}
              contentFit="contain"
            />
          </Pressable>
          <Pressable onPress={() => setAvatar("5937551.jpg")}>
          <Image
              style={avatar === "5937551.jpg" ? styles.selectedImage : styles.image}
              source={imagePath5937551}
              contentFit="contain"
            />
          </Pressable>
          <Pressable onPress={() => setAvatar("5937552.jpg")}>
          <Image
              style={avatar === "5937552.jpg" ? styles.selectedImage : styles.image}
              source={imagePath5937552}
              contentFit="contain"
            />
          </Pressable>
          <Pressable onPress={() => setAvatar("5937553.jpg")}>
            <Image
              style={avatar === "5937553.jpg" ? styles.selectedImage : styles.image}
              source={imagePath5937553}
              contentFit="contain"
            />
          </Pressable>
          <Pressable onPress={() => setAvatar("5937554.jpg")}>
            <Image
              style={avatar === "5937554.jpg" ? styles.selectedImage : styles.image}
              source={imagePath5937554}
              contentFit="contain"
            />
          </Pressable>
          <Pressable onPress={() => setAvatar("5937555.jpg")}>
          <Image
              style={avatar === "5937555.jpg" ? styles.selectedImage : styles.image}
              source={imagePath5937555}
              contentFit="contain"
            />
          </Pressable>
          <Pressable onPress={() => setAvatar("5937556.jpg")}>
            <Image
              style={avatar === "5937556.jpg" ? styles.selectedImage : styles.image}
              source={imagePath5937556}
              contentFit="contain"
            />
          </Pressable>
          <Pressable onPress={() => setAvatar("5937557.jpg")}>
            <Image
              style={avatar === "5937557.jpg" ? styles.selectedImage : styles.image}
              source={imagePath5937557}
              contentFit="contain"
            />
          </Pressable>
          <Pressable onPress={() => setAvatar("5937558.jpg")}>
            <Image
              style={avatar === "5937558.jpg" ? styles.selectedImage : styles.image}
              source={imagePath5937558}
              contentFit="contain"
            />
          </Pressable>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
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
  subTitleText: {
    fontSize: 24,
    margin: 15,
    marginTop: 25,
    fontWeight: 'bold'
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
    justifyContent: 'center',
    minHeight: 0
  },
  image: {
    margin: 10,
    width: 100,
    height: 100,
  },
  selectedImage: {
    borderColor: colors.darkGreen,
    borderWidth: 5,
    margin: 10,
    width: 100,
    height: 100
  },
  buttonContainer: {
    flex: 1,
  }
})
