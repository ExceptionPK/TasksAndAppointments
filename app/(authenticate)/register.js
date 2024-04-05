import { StyleSheet, Text, View, SafeAreaView, KeyboardAvoidingView, TextInput, Pressable, Alert } from 'react-native'
import React, { useState } from 'react'
import { MaterialIcons } from '@expo/vector-icons';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios'

const register = () => {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()
    const handleRegister = () => {
        const user = {
            name: name,
            email: email,
            password: password
        }

        axios.post("http://192.168.1.60:3000/register", user).then((response) => {
            console.log(response)
            Alert.alert("Registro completado", "Te has registrado exitosamente")
            setEmail("")
            setPassword("")
            setName("")
        }).catch((error) => {
            Alert.alert("Registro incorrecto", "Ha ocurrido un error durante el registro")
            console.log("error", error)
        })
    }
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "white", alignItems: "center" }}>
            <View style={{ marginTop: 80 }}>
                <Text style={{ fontSize: 30, fontWeight: 600, color: "#406ef2" }}>TASKS & APPOINTMENTS</Text>
            </View>
            <KeyboardAvoidingView style={{ width: 300 }}>
                <View style={{ alignItems: "center" }}>
                    <Text style={{ fontSize: 18, fontWeight: "600", marginTop: 20 }}>Registrate</Text>
                </View>

                <View style={{ marginTop: 70 }}>

                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#e9eaec", paddingVertical: 5, borderRadius: 5, marginTop: 20 }}>
                        <Ionicons style={{ marginLeft: 8, color: "gray" }} name="person" size={24} color="gray" />
                        <TextInput
                            value={name}
                            onChangeText={(text) => setName(text)}
                            style={{
                                color: "gray",
                                marginVertical: 10,
                                width: 300,
                                fontSize: email ? 18 : 18
                            }}
                            placeholder='Introduce tu nombre'></TextInput>
                    </View>

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