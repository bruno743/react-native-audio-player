import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AudioList from '../screens/AudioList';
import Player from '../screens/Player';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import Colors from '../misc/Colors';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen
            name='AudioList'
            component={AudioList}
            options={{
                tabBarActiveTintColor: Colors.ITEM_COLOR,
                tabBarInactiveTintColor: Colors.ACTIVE_BG,
                tabBarIcon: ({size, color}) => (
                    <MaterialIcons name='headset' size={size} color={color} />
                ),
                tabBarStyle: {backgroundColor: Colors.APP_BG},
            }}
        />
        <Tab.Screen
            name='Player'
            component={Player}
            options={{
                tabBarActiveTintColor: Colors.ITEM_COLOR,
                tabBarInactiveTintColor: Colors.ACTIVE_BG,
                tabBarIcon: ({size, color}) => (
                        <FontAwesome5 name='compact-disc' size={size} color={color} />
                    ),
                tabBarStyle: {backgroundColor: Colors.APP_BG},
            }}
        />
    </Tab.Navigator>
  );
};

export default AppNavigator;