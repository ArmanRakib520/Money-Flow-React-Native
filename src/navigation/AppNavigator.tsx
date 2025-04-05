import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, StyleSheet, View } from 'react-native';
import { COLORS, SIZES } from '../utils/theme';

// Import screens (we'll create these later)
import HomeScreen from '../screens/HomeScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SuggestionsScreen from '../screens/SuggestionsScreen';
import TransactionDetailScreen from '../screens/TransactionDetailScreen';

// Define the param list for the stack navigator
export type RootStackParamList = {
  Main: undefined;
  AddTransaction: { type: 'income' | 'expense' } | undefined;
  TransactionDetail: { id: string; type: 'income' | 'expense' };
};

// Define the param list for the tab navigator
export type MainTabParamList = {
  Home: undefined;
  Reports: undefined;
  Suggestions: undefined;
};

// Create navigators
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab bar icons
const TabBarIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  let iconName = '';
  
  switch (name) {
    case 'Home':
      iconName = '🏠';
      break;
    case 'Reports':
      iconName = '📊';
      break;
    case 'Suggestions':
      iconName = '💡';
      break;
    default:
      iconName = '❓';
  }
  
  return (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <Text style={styles.iconText}>{iconName}</Text>
    </View>
  );
};

// Tab Navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <TabBarIcon name="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarLabel: 'Reports',
          tabBarIcon: ({ focused }) => <TabBarIcon name="Reports" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Suggestions"
        component={SuggestionsScreen}
        options={{
          tabBarLabel: 'Suggestions',
          tabBarIcon: ({ focused }) => <TabBarIcon name="Suggestions" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

// Root Stack Navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: COLORS.white,
          },
          headerTintColor: COLORS.primary,
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddTransaction"
          component={AddTransactionScreen}
          options={({ route }) => ({
            title: route.params?.type === 'income' ? 'Add Income' : 'Add Expense',
          })}
        />
        <Stack.Screen
          name="TransactionDetail"
          component={TransactionDetailScreen}
          options={({ route }) => ({
            title: route.params.type === 'income' ? 'Income Details' : 'Expense Details',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  focusedIcon: {
    backgroundColor: COLORS.primary + '20', // 20% opacity
    borderRadius: 15,
  },
  iconText: {
    fontSize: 16,
  },
});

export default AppNavigator; 