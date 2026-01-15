import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TaskProvider } from './src/context/TaskContext';
import { SectionProvider } from './src/context/SectionContext';
import { HomeScreen, AddTaskScreen, TaskDetailScreen, SectionsScreen } from './src/screens';
import { Colors } from './src/constants/colors';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SectionProvider>
      <TaskProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: Colors.background,
              },
              headerTintColor: Colors.text,
              headerTitleStyle: {
                fontWeight: '600',
              },
              headerShadowVisible: false,
              contentStyle: {
                backgroundColor: Colors.background,
              },
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
              options={{
                title: 'New Task',
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="TaskDetail"
              component={TaskDetailScreen}
              options={{
                title: 'Task Details',
              }}
            />
            <Stack.Screen
              name="Sections"
              component={SectionsScreen}
              options={{
                title: 'Manage Files',
                presentation: 'modal',
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </TaskProvider>
    </SectionProvider>
  );
}
