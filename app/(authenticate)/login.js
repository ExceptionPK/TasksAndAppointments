import { StyleSheet, Text, View, SafeAreaView, KeyboardAvoidingView, TextInput, Modal, Alert, TouchableOpacity, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import { AntDesign } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [isForgotPasswordModalVisible, setIsForgotPasswordModalVisible] = useState(false)
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
    const router = useRouter()

    // Función para verificar el estado del inicio de sesión al cargar el componente
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                // Verificar si hay un token de autenticación almacenado en AsyncStorage
                const token = await AsyncStorage.getItem('authToken')
                // Si hay un token, redirigir al usuario a la página de inicio
                if (token) {
                    router.replace('/(tabs)/home')
                }
            } catch (error) {
                console.log(error)
            }
        }
        // Llamar a la función de verificación del estado del inicio de sesión al cargar el componente
        checkLoginStatus()
    }, [])

    // Función para manejar el inicio de sesión
    const handleLogin = () => {
        setLoading(true)
        // Eliminar espacios en blanco de los datos ingresados por el usuario
        const trimmedEmail = email.trim()
        const trimmedPassword = password.trim()

        // Verificar si algún campo está vacío y mostrar una alerta si es así
        if (!trimmedEmail || !trimmedPassword) {
            Alert.alert('Campos vacíos', 'Por favor, completa todos los campos.')
            setLoading(false)
            return
        }

        // Verificar si el correo electrónico tiene un formato válido y pertenece a un dominio permitido
        const emailEncript = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const allowedDomains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'icloud.com']
        const emailDomain = trimmedEmail.split('@')[1]

        if (!emailEncript.test(trimmedEmail) || !allowedDomains.includes(emailDomain)) {
            Alert.alert('Correo electrónico inválido', 'Por favor, introduce un correo electrónico válido.')
            setLoading(false)
            return
        }

        // Crear un objeto de usuario con los datos ingresados
        const user = {
            email: trimmedEmail,
            password: trimmedPassword
        }

        // Enviar la solicitud de inicio de sesión al servidor
        axios.post('https://apita.onrender.com/login', user)
            .then((response) => {
                const token = response.data.token
                AsyncStorage.setItem('authToken', token)
                setLoading(false)
                router.replace('/(tabs)/home')
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    Alert.alert('Credenciales incorrectas', 'Los datos proporcionados no son válidos.')
                    setLoading(false)
                } else {
                    console.error('Error en la solicitud de inicio de sesión:', error)
                    Alert.alert('Error', 'Ha ocurrido un error durante el inicio de sesión. Por favor, inténtalo de nuevo más tarde.')
                    setLoading(false)
                }
            })
    }

    // Función para manejar la apertura del modal de restablecimiento de contraseña
    const handleForgotPassword = () => {
        setIsForgotPasswordModalVisible(true)
    }

    // Función para cerrar el modal de restablecimiento de contraseña
    const handleCloseForgotPasswordModal = () => {
        setIsForgotPasswordModalVisible(false)
        setForgotPasswordEmail('')
    }

    // Función para enviar un correo electrónico de restablecimiento de contraseña
    const handleSendPasswordResetEmail = async () => {
        setLoading(true)
        if (!forgotPasswordEmail.trim()) {
            Alert.alert('Campo vacío', 'Por favor, ingresa tu correo electrónico.')
            setLoading(false)
            return
        }

        try {
            await axios.post('https://apita.onrender.com/forgot-password', { email: forgotPasswordEmail })
            Alert.alert('Correo enviado', 'Se ha enviado un correo electrónico de restablecimiento de contraseña.')
            setLoading(false)
            handleCloseForgotPasswordModal()
        } catch (error) {
            console.log(error)
            Alert.alert('Error de envío', 'Hubo un error al enviar el correo electrónico de restablecimiento de contraseña.')
            setLoading(false)
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white', alignItems: 'center' }}>
            <View style={{ marginTop: 80 }}>
                <Text style={{ fontSize: 30, fontWeight: '800', color: '#406ef2' }}>TASKS & APPOINTMENTS</Text>
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

                    <View style={{ marginTop: 145 }} />

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

                {loading && (
                    <Image
                        source={require('./loading.gif')}
                        style={{ width: 140, height: 90, position: 'absolute', top: '65%', left: '28%', marginTop: -50 }}
                    />
                )}

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

