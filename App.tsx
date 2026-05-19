import 'react-native-gesture-handler';
import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import PracticeScreen from './src/screens/PracticeScreen';
import AdminScreen from './src/screens/AdminScreen';
import SermonEditorScreen from './src/screens/SermonEditorScreen';
import ChapterEditorScreen from './src/screens/ChapterEditorScreen';
import type { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#1a3c6e' },
            headerTintColor: '#ffffff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Versículos Bíblicos' }}
          />
          <Stack.Screen name="Practice" component={PracticeScreen} />
          <Stack.Screen
            name="Admin"
            component={AdminScreen}
            options={{ title: 'Administrar Contenido' }}
          />
          <Stack.Screen
            name="SermonEditor"
            component={SermonEditorScreen}
            options={({ route }) => ({
              title: route.params?.sermonId ? 'Editar Sermón' : 'Nuevo Sermón',
            })}
          />
          <Stack.Screen
            name="ChapterEditor"
            component={ChapterEditorScreen}
            options={({ route }) => ({
              title: route.params?.chapterId ? 'Editar Capítulo' : 'Nuevo Capítulo',
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
