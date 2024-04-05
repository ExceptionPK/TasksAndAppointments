import { Tabs } from 'expo-router'
import { FontAwesome } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Layout() {
    return (
        <Tabs>
            <Tabs.Screen
                name='home'
                options={{
                    tabBarLabel: "",
                    tabBarLabelStyle: { color: '#406ef2' },
                    headerShown: false,
                    tabBarIcon: ({ focused }) =>
                        focused ? (
                            <FontAwesome name="tasks" size={27} color="#406ef2" />
                        ) : (
                            <FontAwesome name="tasks" size={27} color="black" />
                        )
                }}
            />

            <Tabs.Screen
                name='calendar'
                options={{
                    tabBarLabel: "",
                    tabBarLabelStyle: { color: '#406ef2' },
                    headerShown: false,
                    tabBarIcon: ({ focused }) =>
                        focused ? (
                            <AntDesign name="calendar" size={27} color="#406ef2" />
                        ) : (
                            <AntDesign name="calendar" size={27} color="black" />
                        )
                }}
            />

            <Tabs.Screen
                name='profile'
                options={{
                    tabBarLabel: "",
                    tabBarLabelStyle: { color: '#406ef2' },
                    headerShown: false,
                    tabBarIcon: ({ focused }) =>
                        focused ? (
                            <MaterialCommunityIcons name="account-details" size={35} color="#406ef2" />
                        ) : (
                            <MaterialCommunityIcons name="account-details" size={35} color="black" />
                        )
                }}
            />
        </Tabs>
    )
}