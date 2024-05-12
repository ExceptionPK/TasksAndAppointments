import { Stack } from 'expo-router'

export default function Layout() {
    return (
        // Componente Stack que define la estructura de navegación de la aplicación
        <Stack screenOptions={{headerShown:false}}>
            <Stack.Screen name='index' />
        </Stack>
    )
}