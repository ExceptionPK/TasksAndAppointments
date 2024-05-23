import { ScrollView, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import moment from 'moment'
import { Calendar } from 'react-native-calendars'
import axios from 'axios'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { FontAwesome, MaterialIcons } from '@expo/vector-icons'
import { decode as atob } from 'base-64'

const Index = () => {
  const today = moment().format('YYYY-MM-DD')
  const [selectedDate, setSelectedDate] = useState(today)
  const router = useRouter()
  const [todos, setTodos] = useState([])
  const [userId, setUserId] = useState(null)

  // Efecto para verificar si hay un usuario autenticado al cargar el componente
  useEffect(() => {
    checkAuthenticatedUser() // Llamar a la función para verificar el usuario autenticado
  }, [])

  // Función asincrónica para verificar si hay un usuario autenticado
  const checkAuthenticatedUser = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken') // Obtener el token de autenticación del almacenamiento local
      if (token) {
        const decodedToken = JSON.parse(atob(token.split('.')[1])) // Decodificar el token para obtener el ID del usuario
        const userId = decodedToken.userId // Extraer el ID del usuario del token decodificado
        setUserId(userId) // Establecer el ID del usuario en el estado
      } else {
        router.replace('/login')
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Efecto para obtener las tareas completadas del usuario y mantenerlas actualizadas cada 3 segundos
  useEffect(() => {
    if (userId) {
      fetchCompletedTodos()
      const interval = setInterval(fetchCompletedTodos, 3000)
      return () => clearInterval(interval)
    }
  }, [selectedDate, userId])

  // Función para obtener las tareas completadas del usuario
  const fetchCompletedTodos = async () => {
    try {
      if (!userId) return
      // Realizar una solicitud HTTP para obtener las tareas completadas del usuario para la fecha seleccionada
      const response = await axios.get(
        `https://apita.onrender.com/users/${userId}/todos/completed/${selectedDate}`
      )

      // Extraer las tareas completadas de la respuesta
      const completedTodos = response.data.completedTodos || []
      setTodos(completedTodos) // Establecer las tareas completadas en el estado
    } catch (error) {
      console.log('error', error)
    }
  }

  // Función para manejar la selección de día en el calendario
  const handleDayPress = (day) => {
    setSelectedDate(day.dateString) // Establecer la fecha seleccionada en el estado
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: '#7CB9E8' },
        }}
      />

      <ScrollView style={{ flex: 1 }}>
        <View style={{ marginTop: 20 }} />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            marginVertical: 10,
            marginHorizontal: 10,
          }}
        >
          <Text style={{ fontWeight: '900', marginRight: 'auto' }}>Tareas completadas</Text>
          <MaterialIcons name='arrow-drop-down' size={24} color='black' />
        </View>

        {todos?.map((item, index) => (
          <Pressable
            style={{
              backgroundColor: '#e7edfd',
              padding: 10,
              borderRadius: 7,
              marginVertical: 5,
              marginHorizontal: 10,
            }}
            key={index}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <FontAwesome name='circle' size={18} color='gray' />
              <Text
                style={{
                  flex: 1,
                  textDecorationLine: 'line-through',
                  color: 'gray',
                  fontWeight: '500'
                }}
              >
                {item?.title}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}

export default Index

const styles = StyleSheet.create({})
