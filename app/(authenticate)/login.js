import { StyleSheet, Text, View, SafeAreaView, KeyboardAvoidingView, TextInput, Modal, Alert, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import { AntDesign } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isForgotPasswordModalVisible, setIsForgotPasswordModalVisible] = useState(false)
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
    const router = useRouter()

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken')
                if (token) {
                    router.replace('/(tabs)/home')
                }
            } catch (error) {
                console.log(error)
            }
        }
        checkLoginStatus()
    }, [])

    const handleLogin = () => {
        const trimmedEmail = email.trim()
        const trimmedPassword = password.trim()

        if (!trimmedEmail || !trimmedPassword) {
            Alert.alert('Campos vacíos', 'Por favor, completa todos los campos.')
            return
        }

        const emailEncript = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailEncript.test(trimmedEmail) || !trimmedEmail.endsWith('@gmail.com')) {
            Alert.alert('Correo electrónico inválido', 'Por favor, introduce un correo electrónico válido.')
            return;
        }

        const user = {
            email: trimmedEmail,
            password: trimmedPassword
        }

        axios.post('http://192.168.30.174:3000/login', user)
            .then((response) => {
                const token = response.data.token
                AsyncStorage.setItem('authToken', token)
                router.replace('/(tabs)/home')
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    Alert.alert('Credenciales incorrectas', 'El correo electrónico o la contraseña proporcionados no son válidos.')
                } else {
                    console.error('Error en la solicitud de inicio de sesión:', error)
                    Alert.alert('Error', 'Ha ocurrido un error durante el inicio de sesión. Por favor, inténtalo de nuevo más tarde.')
                }
            })
    }


    const handleForgotPassword = () => {
        setIsForgotPasswordModalVisible(true)
    }

    const handleCloseForgotPasswordModal = () => {
        setIsForgotPasswordModalVisible(false)
        setForgotPasswordEmail('')
    }

    const handleSendPasswordResetEmail = async () => {
        if (!forgotPasswordEmail.trim()) {
            Alert.alert('Campo vacío', 'Por favor, ingresa tu correo electrónico.');
            return;
        }

        try {
            await axios.post('http://192.168.30.174:3000/forgot-password', { email: forgotPasswordEmail })
            Alert.alert('Correo enviado', 'Se ha enviado un correo electrónico de restablecimiento de contraseña.')
            handleCloseForgotPasswordModal()
        } catch (error) {
            console.log(error)
            Alert.alert('Error de envío', 'Hubo un error al enviar el correo electrónico de restablecimiento de contraseña. Comprueba que has ingresado bien el correo electrónico.')
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white', alignItems: 'center' }}>
            <View style={{ marginTop: 80 }}>
                <Text style={{ fontSize: 30, fontWeight: 800, color: '#406ef2' }}>TASKS & APPOINTMENTS</Text>
            </View>
            <KeyboardAvoidingView style={{ width: 300 }}>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', marginTop: 20 }}>Inicia sesión</Text>
                </View>

                <View style={{ marginTop: 70 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#e9eaec', paddingVertical: 5, borderRadius: 5, marginTop: 30 }}>
                        <MaterialIcons style={{ marginLeft: 8, color: 'gray' }} name='email' size={24} color='black' />
                        <TextInput
                            value={email}
                            onChangeText={(text) => {
                                if (text.length <= 40) {
                                    setEmail(text.trim())
                                }
                            }}
                            style={{
                                color: 'gray',
                                marginVertical: 10,
                                width: 300,
                                fontSize: email ? 18 : 18
                            }}
                            placeholder='Introduce tu correo'></TextInput>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#e9eaec', paddingVertical: 5, borderRadius: 5, marginTop: 20 }}>
                        <AntDesign style={{ marginLeft: 8, color: 'gray' }} name='lock1' size={24} color='black' />
                        <TextInput
                            value={password}
                            secureTextEntry={true}
                            onChangeText={(text) => {
                                if (text.length <= 14) {
                                    setPassword(text.trim())
                                }
                            }}
                            style={{
                                color: 'gray',
                                marginVertical: 10,
                                width: 300,
                                fontSize: email ? 18 : 18
                            }}
                            placeholder='Introduce tu contraseña'></TextInput>

                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, justifyContent: 'space-between' }}>

                    </View>

                    <View style={{ marginTop: 140 }} />

                    <TouchableOpacity activeOpacity={0.7} onPress={handleLogin} style={{ width: 200, backgroundColor: '#406ef2', padding: 15, borderRadius: 5, marginLeft: 'auto', marginRight: 'auto' }}>
                        <Text style={{ textAlign: 'center', color: 'white', fontWeight: 'bold', fontSize: 18 }}>Iniciar sesión</Text>
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={0.7} onPress={() => router.replace('/register')} style={{ marginTop: 15 }}>
                        <Text style={{ textAlign: 'center', color: 'gray', fontSize: 16 }}>¿No tienes una cuenta? Regístrate</Text>
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={0.5} onPress={handleForgotPassword} style={{ marginTop: 15 }}>
                        <Text style={{ textAlign: 'center', color: '#007FFF', fontWeight: 600 }}>Olvidé mi contraseña</Text>
                    </TouchableOpacity>

                </View>

                <Modal
                    visible={isForgotPasswordModalVisible}
                    transparent={true}
                    animationType='fade'
                    onRequestClose={handleCloseForgotPasswordModal}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>Recuperar contraseña</Text>
                            <TextInput
                                value={forgotPasswordEmail}
                                onChangeText={(text) => {
                                    if (text.length <= 40) {
                                        setForgotPasswordEmail(text.trim())
                                    }
                                }}
                                placeholder='Correo electrónico'
                                style={styles.input}
                            />

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity activeOpacity={0.7} onPress={handleSendPasswordResetEmail} style={[styles.button, { backgroundColor: '#406ef2' }]}>
                                    <Text style={{ color: 'white', textAlign: 'center' }}>Enviar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity activeOpacity={0.7} onPress={handleCloseForgotPasswordModal} style={[styles.button, { backgroundColor: '#ccc' }]}>
                                    <Text style={{ color: 'white', textAlign: 'center' }}>Cerrar</Text>
                                </TouchableOpacity>
                            </View>



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
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        width: '45%',
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
})

