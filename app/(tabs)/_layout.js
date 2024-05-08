import { Tabs } from 'expo-router'
import { FontAwesome } from '@expo/vector-icons'
import { AntDesign } from '@expo/vector-icons'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { View } from 'react-native'

export default function Layout() {
    return (
        <Tabs>
            <Tabs.Screen
                name='home'
                options={{
                    tabBarLabel: "",
                    tabBarLabelStyle: { color: '#6689ee' },
                    headerShown: false,
                    tabBarIcon: ({ focused }) =>
                        focused ? (
                            <View style={{ marginTop: 10 }}>
                                <FontAwesome name="tasks" size={27} color="#6689ee" />
                            </View>
                        ) : (
                            <View style={{ marginTop: 10 }}>
                                <FontAwesome name="tasks" size={27} color="black" />
                            </View>

                        )
                }}
            />

            <Tabs.Screen
                name='calendar'
                options={{
                    tabBarLabel: "",
                    tabBarLabelStyle: { color: '#6689ee' },
                    headerShown: false,
                    tabBarIcon: ({ focused }) =>
                        focused ? (
                            <View style={{ marginTop: 9 }}>
                                <AntDesign name="calendar" size={27} color="#6689ee" />
                            </View>
                        ) : (
                            <View style={{ marginTop: 9 }}>
                                <AntDesign name="calendar" size={27} color="black" />
                            </View>
                        )
                }}
            />

            <Tabs.Screen
                name='profile'
                options={{
                    tabBarLabel: "",
                    tabBarLabelStyle: { color: '#6689ee' },
                    headerShown: false,
                    tabBarIcon: ({ focused }) =>
                        focused ? (
                            <View style={{ marginTop: 6 }}>
                                <MaterialCommunityIcons name="account-details" size={34} color="#6689ee" />
                            </View>
                        ) : (
                            <View style={{ marginTop: 6 }}>
                                <MaterialCommunityIcons name="account-details" size={34} color="black" />
                            </View>
                        )
                }}
            />
        </Tabs>
    )
}
