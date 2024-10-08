// Based on example code from Expo Docs
// Section: Using React Context and Route Groups - app/(app)/index.tsx
// https://docs.expo.dev/router/reference/authentication/

import { Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useSession } from '../../ctx';


export default function Index() {
  const { signOut } = useSession();
  return (
    <Redirect href="/dashboard" />
  );
}
