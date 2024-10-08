import { Text, View, StyleSheet } from "react-native";
import { useState } from "react";
import { Stack } from 'expo-router';
import LoginForm from "@/components/LoginForm";
import RegistrationForm from "@/components/RegistrationForm";

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
  black: '#000000', 
};

export default function Login() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false
        }}
      />
      <View style={styles.header}>
        <Text style={styles.headerText}>MyFitnessBuddy</Text>
      </View>
      {showLogin && <LoginForm />}
      {showLogin && 
        <View style={styles.bodyTextContainer}>
          <Text style={styles.bodyText}>Don't have an account? <Text onPress={() => setShowLogin(false)} style={styles.linkText}>Sign Up</Text></Text>
        </View>}
      {!showLogin && <RegistrationForm />}
      {!showLogin && 
        <View style={styles.bodyTextContainer}>
          <Text style={styles.bodyText}>Already have an account? <Text onPress={() => setShowLogin(true)} style={styles.linkText}>Log In</Text></Text>
        </View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    flexDirection: 'column'
  },
  header: {
    backgroundColor: colors.lightGreen,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 0.3
  },
  headerText: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
  },
  bodyText: {
    fontSize: 16,
    margin: 15
  },
  bodyTextContainer: {
    flex: 0.3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray
  },
  linkText: {
    textDecorationLine: 'underline',
    color: 'blue'
  }
})