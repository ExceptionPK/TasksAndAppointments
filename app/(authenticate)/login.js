import { StyleSheet, Text, View, SafeAreaView, KeyboardAvoidingView, TextInput, Pressable, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import { MaterialIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'

const login = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isForgotPasswordModalVisible, setIsForgotPasswordModalVisible] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
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
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        const user = {
            email: trimmedEmail,
            password: trimmedPassword
        }

        axios.post("http://192.168.1.60:3000/login", user).then((response) => {
            const token = response.data.token;
            AsyncStorage.setItem("authToken", token)
            router.replace("/(tabs)/home")
        })
    }

    const handleForgotPassword = () => {
        setIsForgotPasswordModalVisible(true)
    }

    const handleCloseForgotPasswordModal = () => {
        setIsForgotPasswordModalVisible(false)
        setForgotPasswordEmail("")
    }

    const handleSendPasswordResetEmail = async () => {
        try {
            const trimmedForgotPasswordEmail = forgotPasswordEmail.trim();

            await axios.post("http://192.168.1.60:3000/forgot-password", { email: trimmedForgotPasswordEmail });

            alert("Se ha enviado un correo electrónico de restablecimiento de contraseña.");

            handleCloseForgotPasswordModal();
        } catch (error) {
            console.log(error);
            alert("Hubo un error al enviar el correo electrónico de restablecimiento de contraseña.");
        }
    };

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
                            onChangeText={(text) => setEmail(text.trim())}
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
                            onChangeText={(text) => setPassword(text.trim())}
                            style={{
                                color: "gray",
                                marginVertical: 10,
                                width: 300,
                                fontSize: email ? 18 : 18
                            }}
                            placeholder='Introduce tu contraseña'></TextInput>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12, justifyContent: "space-between" }}>

                    </View>

                    <View style={{ marginTop: 140 }} />

                    <Pressable onPress={handleLogin} style={{ width: 200, backgroundColor: "#406ef2", padding: 15, borderRadius: 5, marginLeft: "auto", marginRight: "auto" }}>
                        <Text style={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: 18 }}>Iniciar sesión</Text>
                    </Pressable>

                    <Pressable onPress={() => router.replace("/register")} style={{ marginTop: 15 }}>
                        <Text style={{ textAlign: "center", color: "gray", fontSize: 16 }}>¿No tienes una cuenta? Regístrate</Text>
                    </Pressable>

                    <Pressable onPress={handleForgotPassword} style={{ marginTop: 15 }}>
                        <Text style={{ textAlign: "center", color: "#007FFF", fontWeight: 600 }}>Olvidé mi contraseña</Text>
                    </Pressable>

                </View>

                <Modal
                    visible={isForgotPasswordModalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={handleCloseForgotPasswordModal}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>Recuperar contraseña</Text>
                            <TextInput
                                value={forgotPasswordEmail}
                                onChangeText={setForgotPasswordEmail}
                                placeholder="Correo electrónico"
                                style={styles.input}
                            />
                            <Pressable onPress={handleSendPasswordResetEmail} style={styles.sendButton}>
                                <Text style={{ color: "white" }}>Enviar</Text>
                            </Pressable>
                            <Pressable onPress={handleCloseForgotPasswordModal} style={styles.closeButton}>
                                <Text style={{ color: "white" }}>Cerrar</Text>
                            </Pressable>

                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default login

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    input: {
        backgroundColor: '#e9eaec',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 5,
        marginBottom: 20,
    },
    closeButton: {
        backgroundColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        alignItems: 'center',
    },
    sendButton: {
        backgroundColor: '#406ef2',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
})

