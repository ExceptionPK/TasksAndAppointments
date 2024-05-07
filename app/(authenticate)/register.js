import { StyleSheet, Text, View, SafeAreaView, KeyboardAvoidingView, TextInput, Pressable, Alert } from 'react-native'
import React, { useState } from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import { AntDesign, Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import axios from 'axios'

const register = () => {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()

    const handleRegister = () => {
        const trimmedName = name.trim()
        const trimmedEmail = email.trim()
        const trimmedPassword = password.trim()

        if (!trimmedEmail || !trimmedPassword || !trimmedName) {
            Alert.alert("Campos vacíos", "Por favor, completa todos los campos.")
            return
        }

        const containsNumber = /\d/.test(trimmedName)
        if (containsNumber) {
            Alert.alert("Nombre inválido", "El nombre no puede contener números.")
            return
        }

        const passwordEncript = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{6,}$/
        if (!passwordEncript.test(trimmedPassword)) {
            Alert.alert("Contraseña inválida", "La contraseña debe tener entre 6 y 14 caracteres, incluyendo al menos un número, una letra mayúscula, una letra minúscula y un símbolo.")
            return
        }

        const emailEncript = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailEncript.test(trimmedEmail) || !trimmedEmail.endsWith("@gmail.com")) {
            Alert.alert("Correo electrónico inválido", "Por favor, introduce un correo electrónico válido.")
            return;
        }

        const user = {
            name: trimmedName,
            email: trimmedEmail,
            password: trimmedPassword
        }

        axios.post("http://192.168.1.60:3000/register", user)
            .then((response) => {
                console.log(response)
                Alert.alert("Registro completado", "Te has registrado exitosamente")
                setEmail("")
                setPassword("")
                setName("")
            })
            .catch((error) => {
                Alert.alert("Registro incorrecto", "Ha ocurrido un error durante el registro")
                console.log("error", error)
            })
    }


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "white", alignItems: "center" }}>
            <View style={{ marginTop: 80 }}>
                <Text style={{ fontSize: 30, fontWeight: 800, color: "#406ef2" }}>TASKS & APPOINTMENTS</Text>
            </View>
            <KeyboardAvoidingView style={{ width: 300 }}>
                <View style={{ alignItems: "center" }}>
                    <Text style={{ fontSize: 18, fontWeight: "700", marginTop: 20 }}>Regístrate</Text>
                </View>

                <View style={{ marginTop: 70 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#e9eaec", paddingVertical: 5, borderRadius: 5, marginTop: 20 }}>
                        <Ionicons style={{ marginLeft: 8, color: "gray" }} name="person" size={24} color="gray" />
                        <TextInput
                            value={name}
                            onChangeText={(text) => {
                                if (text.length <= 20) {
                                    setName(text.trim())
                                }
                            }}
                            style={{
                                color: "gray",
                                marginVertical: 10,
                                width: 300,
                                fontSize: 18
                            }}
                            placeholder='Introduce tu nombre'
                        />
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#e9eaec", paddingVertical: 5, borderRadius: 5, marginTop: 20 }}>
                        <MaterialIcons style={{ marginLeft: 8, color: "gray" }} name="email" size={24} color="black" />
                        <TextInput
                            value={email}
                            onChangeText={(text) => {
                                if (text.length <= 40) {
                                    setEmail(text.trim())
                                }
                            }}
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
                            onChangeText={(text) => {
                                if (text.length <= 14) {
                                    setPassword(text.trim())
                                }
                            }}
                            style={{
                                color: "gray",
                                marginVertical: 10,
                                width: 300,
                                fontSize: email ? 18 : 18
                            }}
                            placeholder='Introduce tu contraseña'></TextInput>
                    </View>

                    <View style={{ marginTop: 90 }} />

                    <Pressable onPress={handleRegister} style={{ width: 200, backgroundColor: "#406ef2", padding: 15, borderRadius: 5, marginLeft: "auto", marginRight: "auto" }}>
                        <Text style={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: 18 }}>Registrarse</Text>
                    </Pressable>

                    <Pressable onPress={() => router.replace("/login")} style={{ marginTop: 15 }}>
                        <Text style={{ textAlign: "center", color: "gray", fontSize: 16 }}>Ya tengo una cuenta</Text>
                    </Pressable>

                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default register

const styles = StyleSheet.create({})

