/**
 * Learn more about createBottomTabNavigator:
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */

import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import MapScreen from '../screens/MapScreen';
import DirectionScreen from '../screens/DirectionScreen';
import { BottomTabParamList, MapTabParamList, DirectionTabParamList, MenuTabParamList } from '../types';
import MenuScreen from '../screens/MenuScreen';

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="Map"
      tabBarOptions={{ activeTintColor: Colors[colorScheme].tint }}>
      <BottomTab.Screen
        name="Menu"
        component={TabZeroNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="bookmarks-outline" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Map"
        component={TabOneNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="planet-outline" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Direction"
        component={TabTwoNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="paper-plane-outline" color={color} />,
        }}
      />
    </BottomTab.Navigator>
  );
}

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon(props: { name: React.ComponentProps<typeof Ionicons>['name']; color: string }) {
  return <Ionicons size={30} style={{ marginBottom: -3 }} {...props} />;
}

// Each tab has its own navigation stack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab

const TabZeroStack = createStackNavigator<MenuTabParamList>();

function TabZeroNavigator() {
  return (
    <TabZeroStack.Navigator>
      <TabZeroStack.Screen
        name="MenuScreen"
        component={MenuScreen}
        options={{ headerTitle: 'Menu Tab Title' }}
      />
    </TabZeroStack.Navigator>
  );
}

const TabOneStack = createStackNavigator<MapTabParamList>();

function TabOneNavigator() {
  return (
    <TabOneStack.Navigator>
      <TabOneStack.Screen
        name="MapScreen"
        component={MapScreen}
        options={{ headerTitle: 'Map Tab Title' }}
      />
    </TabOneStack.Navigator>
  );
}

const TabTwoStack = createStackNavigator<DirectionTabParamList>();

function TabTwoNavigator() {
  return (
    <TabTwoStack.Navigator>
      <TabTwoStack.Screen
        name="DirectionScreen"
        component={DirectionScreen}
        options={{ headerTitle: 'Direction Tab Title' }}
      />
    </TabTwoStack.Navigator>
  );
}
