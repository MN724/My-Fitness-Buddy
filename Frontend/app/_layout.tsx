// Based on example code from Expo Docs
// Section: Using React Context and Route Groups - app/_layout.tsx
// https://docs.expo.dev/router/reference/authentication/

import { Slot } from 'expo-router';
import { SessionProvider } from '../ctx';
import * as SplashScreen from 'expo-splash-screen';

export default function RootLayout() {
  // Set up the auth context and render our layout inside of it.
  return (
    <SessionProvider>
      <Slot />
    </SessionProvider>
  );
}
