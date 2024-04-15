import { StyleSheet, Text, View, SafeAreaView, KeyboardAvoidingView, TextInput, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { MaterialIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'

const login = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const token = await AsyncStorage.getItem("authToken")
                if (token) {
                    router.replace("/(tabs)/home")
                }
            } catch (error) {
                console.log(error)
            }
        }
        checkLoginStatus()
    }, [])
    
    const handleLogin = () => {
        const user = {
            email: email,
            password: password
        }

        axios.post("http://192.168.1.60:3000/login", user).then((response) => {
            const token = response.data.token;
            AsyncStorage.setItem("authToken", token);
            router.replace("/(tabs)/home")
        })
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "white", alignItems: "center" }}>
            <View style={{ marginTop: 80 }}>
                <Text style={{ fontSize: 30, fontWeight: 600, color: "#406ef2" }}>TASKS & APPOINTMENTS</Text>
            </View>
            <KeyboardAvoidingView style={{ width: 300 }}>
                <View style={{ alignItems: "center" }}>
                    <Text style={{ fontSize: 18, fontWeight: "600", marginTop: 20 }}>Inicia sesión</Text>
                </View>

                <View style={{ marginTop: 70 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#e9eaec", paddingVertical: 5, borderRadius: 5, marginTop: 30 }}>
                        <MaterialIcons style={{ marginLeft: 8, color: "gray" }} name="email" size={24} color="black" />
                        <TextInput
                            value={email}
                            onChangeText={(text) => setEmail(text)}
                            style={{
                                color: "gray",
                                marginVertical: 10,
                                width: 300,
                                fontSize: email ? 18 : 18
                            }}
                            placeholder='Introduce tu correo'></TextInput>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#e9eaec", paddingVertical: 5, borderRadius: 5, marginTop: 20 }}>
                        <AntDesign style={{ marginLeft: 8, color: "gray" }} name="lock1" size={24} color="black" />
                        <TextInput
                            value={password}
                            secureTextEntry={true}
                            onChangeText={(text) => setPassword(text)}
                            style={{
                                color: "gray",
                                marginVertical: 10,
                                width: 300,
                                fontSize: email ? 18 : 18
                            }}
                            placeholder='Introduce tu contraseña'></TextInput>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12, justifyContent: "space-between" }}>
                        <Text>Mantener sesión</Text>
                        <Text style={{ color: "#007FFF", fontWeight: 600 }}>Olvidé mi contraseña</Text>
                    </View>

                    <View style={{ marginTop: 60 }} />

                    <Pressable onPress={handleLogin} style={{ width: 200, backgroundColor: "#406ef2", padding: 15, borderRadius: 5, marginLeft: "auto", marginRight: "auto" }}>
                        <Text style={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: 18 }}>Iniciar sesión</Text>
                    </Pressable>

                    <Pressable onPress={() => router.replace("/register")} style={{ marginTop: 15 }}>
                        <Text style={{ textAlign: "center", color: "gray", fontSize: 16 }}>¿No tienes una cuenta? Regístrate</Text>
                    </Pressable>

                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default login

const styles = StyleSheet.create({})