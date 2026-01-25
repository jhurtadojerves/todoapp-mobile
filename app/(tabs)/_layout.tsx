import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

import { HeaderMenu } from '@/presentation/components/header-menu';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: '',
        headerRight: () => <HeaderMenu />,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
