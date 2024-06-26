import { StyleSheet, Text, View, SafeAreaView, KeyboardAvoidingView, TextInput, Alert, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import { AntDesign, Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import axios from 'axios'

const register = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [passwordVisible, setPasswordVisible] = useState(false)
    const router = useRouter()

    // Función para manejar el registro de usuarios
    const handleRegister = () => {
        setLoading(true)
        // Eliminar espacios en blanco de los datos ingresados por el usuario
        const trimmedName = name.trim()
        const trimmedEmail = email.trim()
        const trimmedPassword = password.trim()

        // Verificar si algún campo está vacío y mostrar una alerta si es así
        if (!trimmedEmail || !trimmedPassword || !trimmedName) {
            Alert.alert('Campos vacíos', 'Por favor, completa todos los campos.')
            setLoading(false)
            return
        }

        // Verificar si el nombre contiene números y mostrar una alerta si es así
        const containsNumber = /\d/.test(trimmedName)
        if (containsNumber) {
            Alert.alert('Nombre inválido', 'El nombre no puede contener números.')
            setLoading(false)
            return
        }

        // Verificar si la contraseña cumple con los requisitos y mostrar una alerta si no
        const passwordEncript = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{6,}$/
        if (!passwordEncript.test(trimmedPassword)) {
            Alert.alert('Contraseña inválida', 'La contraseña debe tener entre 6 y 14 caracteres, incluyendo al menos un número, una letra mayúscula, una letra minúscula y un símbolo.')
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

        const user = {
            name: trimmedName,
            email: trimmedEmail,
            password: trimmedPassword
        }

        // Enviar la solicitud de registro al servidor
        axios.post('https://apita.onrender.com/register', user)
            .then((response) => {
                // console.log(response)
                // Redirigir al usuario a la página de inicio de sesión después de un registro exitoso
                setLoading(false)
                router.replace('/login')
                setEmail('')
                setPassword('')
                setName('')
            })
            .catch((error) => {
                Alert.alert('Registro incorrecto', 'Ha ocurrido un error durante el registro')
                setLoading(false)
                console.log('error', error)
            })
    }

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible)
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white', alignItems: 'center' }}>
            <View style={{ marginTop: 80 }}>
                <Text style={{ fontSize: 30, fontWeight: 800, color: '#406ef2' }}>TASKS & APPOINTMENTS</Text>
            </View>
            <KeyboardAvoidingView style={{ width: 300 }}>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', marginTop: 20 }}>Regístrate</Text>
                </View>

                <View style={{ marginTop: 70 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#e9eaec', paddingVertical: 5, borderRadius: 5, marginTop: 20 }}>
                        <Ionicons style={{ marginLeft: 8, color: 'gray' }} name='person' size={24} color='gray' />
                        <TextInput
                            value={name}
                            onChangeText={(text) => {
                                if (text.length <= 20) {
                                    setName(text.trim())
                                }
                            }}
                            style={{
                                color: 'gray',
                                marginVertical: 10,
                                width: 300,
                                fontSize: 18
                            }}
                            placeholder='Introduce tu nombre'
                        />
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#e9eaec', paddingVertical: 5, borderRadius: 5, marginTop: 20 }}>
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
                        <TouchableOpacity onPress={togglePasswordVisibility} style={{ position: 'absolute', right: 15, top: 18, zIndex: 1 }}>
                            <Ionicons name={passwordVisible ? 'eye' : 'eye-off'} size={24} color="#667cc3" />
                        </TouchableOpacity>
                        <TextInput
                            value={password}
                            secureTextEntry={!passwordVisible}
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

                    <View style={{ marginTop: 90 }} />

                    <TouchableOpacity activeOpacity={0.7} onPress={handleRegister} style={{ width: 200, backgroundColor: '#406ef2', padding: 15, borderRadius: 5, marginLeft: 'auto', marginRight: 'auto' }}>
                        <Text style={{ textAlign: 'center', color: 'white', fontWeight: 'bold', fontSize: 18 }}>Registrarse</Text>
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={0.7} onPress={() => router.replace('/login')} style={{ marginTop: 15 }}>
                        <Text style={{ textAlign: 'center', color: 'gray', fontSize: 16 }}>Ya tengo una cuenta</Text>
                    </TouchableOpacity>

                </View>

                {loading && (
                    <Image
                        source={require('./loading.gif')}
                        style={{ width: 140, height: 90, position: 'absolute', top: '76%', left: '27%', marginTop: -50 }}
                    />
                )}

            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default register

const styles = StyleSheet.create({})

