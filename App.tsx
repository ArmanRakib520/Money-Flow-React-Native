/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, SafeAreaView, StyleSheet } from 'react-native';
import { COLORS } from './src/utils/theme';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const App = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <AppProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
          <AppNavigator />
        </SafeAreaView>
      </AppProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
});

export default App;
