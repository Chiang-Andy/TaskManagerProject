import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { TaskProvider } from './src/context/TaskContext';
import { SectionProvider } from './src/context/SectionContext';
import { HomeScreen, AddTaskScreen, TaskDetailScreen, SectionsScreen, CalendarScreen, HistoryScreen, TrashScreen } from './src/screens';
import { Colors } from './src/constants/colors';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL);

const Stack = createNativeStackNavigator();

function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddTask"
        component={AddTaskScreen}
        options={{ title: 'New Task', presentation: 'modal' }}
      />
      <Stack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{ title: 'Task Details' }}
      />
      <Stack.Screen
        name="Sections"
        component={SectionsScreen}
        options={{ title: 'Manage Files', presentation: 'modal' }}
      />
      <Stack.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ title: 'Calendar' }}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: 'Completed Tasks' }}
      />
      <Stack.Screen
        name="Trash"
        component={TrashScreen}
        options={{ title: 'Trash' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ConvexProvider client={convex}>
        <SectionProvider>
          <TaskProvider>
            <NavigationContainer>
              <StatusBar style="dark" />
              <RootNavigator />
            </NavigationContainer>
          </TaskProvider>
        </SectionProvider>
      </ConvexProvider>
    </GestureHandlerRootView>
  );
}
