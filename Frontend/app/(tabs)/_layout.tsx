// Based on example code from Expo Docs
// Section: Using React Context and Route Groups - app/(app)/_layout.tsx
// https://docs.expo.dev/router/reference/authentication/

import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { useSession } from '../../ctx';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const colorScheme = useColorScheme();

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/login" />;
  }


  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          href: null
        }}
      />
      <Tabs.Screen
        name="dashboard/index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'podium' : 'podium-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Exercises',
          tabBarButton: () => null, // Hiding this tab
          //tabBarIcon: ({ color, focused }) => (
          //  <TabBarIcon name={focused ? 'body' : 'body-outline'} color={color} />
          //),
        }}
      />
      <Tabs.Screen
        name="logging"
        options={{
          title: 'Logging',
          tabBarButton: () => null, // Hiding this tab
        }}
      />
      <Tabs.Screen
        name="reorder"
        options={{
          title: 'Reorder',
          tabBarButton: () => null, // Hiding this tab
        }}
      />
      <Tabs.Screen
        name="survey"
        options={{
          href: null
        }}
      />
      <Tabs.Screen
        name="dashboard/getDailyWorkout"
        options={{
          href: null
        }}
      />
      <Tabs.Screen
        name="dashboard/getWeeklyWorkout"
        options={{
          href: null
        }}
      />
    </Tabs>
  );
}
