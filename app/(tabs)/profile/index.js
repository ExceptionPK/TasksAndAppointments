import { Image, StyleSheet, Text, View, Dimensions, Pressable, Animated, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { LineChart } from 'react-native-chart-kit'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { AntDesign } from '@expo/vector-icons'
import { decode as atob } from 'base-64'
import profileImage from '../profile/profile-image.jpg'
import * as ImagePicker from 'expo-image-picker'

const Index = () => {
  const router = useRouter()
  const [completedTasks, setCompletedTasks] = useState(0)
  const [pendingTasks, setPendingTasks] = useState(0)
  const [showOptions, setShowOptions] = useState(false)
  const [rotation] = useState(new Animated.Value(0))
  const [fadeAnim] = useState(new Animated.Value(0))
  const [userId, setUserId] = useState(null)
  const [selectedImageUri, setSelectedImageUri] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [achievementCount, setAchievementCount] = useState(0)


  //  Array de los logros
  const [achievements, setAchievements] = useState([
    { achieved: false, color: '#b1c3f1', text: '5 tareas', textColor: '#cf9258', medalColor: '#cf9258' },
    { achieved: false, color: '#b1c3f1', text: '10 tareas', textColor: '#BEBEBE', medalColor: '#BEBEBE' },
    { achieved: false, color: '#b1c3f1', text: '15 tareas', textColor: '#FFD700', medalColor: '#FFD700' },
    { achieved: false, color: '#b1c3f1', text: '20 tareas', textColor: '#b4d1d7', medalColor: '#b4d1d7' },
    { achieved: false, color: '#b1c3f1', text: '25 tareas', textColor: '#9cd8e6', medalColor: '#9cd8e6' },
    { achieved: false, color: '#b1c3f1', text: '30 tareas', textColor: '#64d7d7', medalColor: '#64d7d7' }
  ])


  // Función para alternar entre modo oscuro y claro
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  // Efecto para verificar si hay un usuario autenticado al cargar el componente
  useEffect(() => {
    checkAuthenticatedUser()
  }, [])

  // Efecto para recuperar la URI de la imagen seleccionada cada vez que cambia el usuario autenticado
  useEffect(() => {
    if (userId) {
      retrieveSelectedImageUri()
    }
  }, [userId])

  // Función para verificar si hay un usuario autenticado y recuperar su ID
  const checkAuthenticatedUser = async () => {
    try {
      // Obtener el token de autenticación del almacenamiento local
      const token = await AsyncStorage.getItem('authToken')
      if (token) {
        // Decodificar el token para obtener el ID del usuario
        const decodedToken = JSON.parse(atob(token.split('.')[1]))
        const userId = decodedToken.userId
        // Establecer el ID del usuario en el estado
        setUserId(userId)
      } else {
        // Si no hay token de autenticación, redirigir al usuario a la página de inicio de sesión
        router.replace('/login')
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Función para alternar la visibilidad de las opciones y animar su aparición
  const toggleOptions = () => {
    setShowOptions(!showOptions)
    Animated.timing(
      rotation,
      {
        toValue: showOptions ? 0 : 100,
        duration: 300,
        useNativeDriver: true,
      }
    ).start()

    Animated.timing(
      fadeAnim,
      {
        toValue: showOptions ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }
    ).start()
  }

  const spin = rotation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg']
  })

  // Función para obtener los datos de las tareas del usuario
  const fetchUserTaskData = async () => {
    try {
      if (!userId) return // Si no hay un ID de usuario, salir de la función

      // Realizar una solicitud HTTP para obtener los datos de las tareas del usuario
      const response = await axios.get(`http://192.168.30.174:3000/users/${userId}/todos/count`)
      const { totalCompletedTodos, totalPendingTodos } = response.data
      setCompletedTasks(totalCompletedTodos)
      setPendingTasks(totalPendingTodos)

      // Calcular el número de logros alcanzados
      const tasksNeededForAchievement = 5
      const achievedCount = Math.floor(totalCompletedTodos / tasksNeededForAchievement)
      setAchievementCount(achievedCount)

      // Actualizar el estado de los logros para que se muestren en pantalla al completarlos
      const updatedAchievements = achievements.map((achievement, index) => {
        if (index < achievedCount) {
          return { ...achievement, achieved: true }
        } else {
          return achievement
        }
      })
      setAchievements(updatedAchievements)
      setAchievements(updatedAchievements)
    } catch (error) {
      console.log('error', error)
    }
  }

  // Efecto para actualizar los datos de las tareas del usuario y mantenerlos actualizados cada 3 segundos
  useEffect(() => {
    if (userId) {
      fetchUserTaskData()
      const interval = setInterval(fetchUserTaskData, 3000)
      return () => clearInterval(interval)
    }
  }, [userId])

  // Función para manejar el cierre de sesión
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken') // Eliminar el token de autenticación del almacenamiento local
      router.replace('/login')
    } catch (error) {
      console.log(error)
    }
  }

  // Función para seleccionar una imagen
  const selectImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync() // Solicitar permisos a la biblioteca de medios del dispositivo
    if (permissionResult.granted === false) {
      alert('Necesitas dar permisos para seleccionar imagenes')
      return
    }

    // Ejecutar la biblioteca de imágenes para que el usuario seleccione una imagen
    const pickerResult = await ImagePicker.launchImageLibraryAsync()
    if (!pickerResult.cancelled && pickerResult.assets && pickerResult.assets.length > 0 && pickerResult.assets[0] !== null) {
      // Si se selecciona una imagen y no se cancela la selección
      setSelectedImageUri(pickerResult.assets[0].uri)
      await saveSelectedImageUriToDatabase(pickerResult.assets[0].uri)
    }
  }

  // Función para recuperar la URI de la imagen seleccionada del almacenamiento local
  const retrieveSelectedImageUri = async () => {
    try {
      const uri = await AsyncStorage.getItem(`selectedImageUri_${userId}`) // Obtener la URI de la imagen seleccionada
      if (uri !== null) {
        setSelectedImageUri(uri)
      } else {
        setSelectedImageUri(require('../profile/profile-image.jpg')) // Establecer una imagen predeterminada como URI de la imagen seleccionada
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }
  // Función para guardar la URI de la imagen seleccionada en la base de datos local
  const saveSelectedImageUriToDatabase = async (uri) => {
    try {
      await AsyncStorage.setItem(`selectedImageUri_${userId}`, uri) // Guardar la URI de la imagen seleccionada en el almacenamiento local
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <View style={{ padding: 10, flex: 1, backgroundColor: 'white' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Image
          style={{ width: 60, height: 60, borderRadius: 30 }}
          source={selectedImageUri && typeof selectedImageUri === 'string' ? { uri: selectedImageUri } : profileImage}
        />
        <View>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>
            Planifica tus tareas con tiempo
          </Text>
          <Text style={{ fontSize: 15, color: 'gray', marginTop: 4 }}>
            Selecciona las categorias
          </Text>
        </View>
      </View>

      <View style={{ marginVertical: 12 }}>
        <Text style={{ fontWeight: 'bold', marginTop: 5 }}>Resumen de tus estadísticas</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            marginVertical: 8,
          }}
        >

          <View
            style={{
              backgroundColor: '#b1c3f1',
              padding: 10,
              borderRadius: 8,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{ textAlign: 'center', fontSize: 16, fontWeight: '900', color: 'white' }}
            >
              {pendingTasks}
            </Text>
            <Text style={{ marginTop: 4, fontWeight: '500', color: 'white' }}>tareas por hacer</Text>
          </View>
          <View
            style={{
              backgroundColor: '#b1c3f1',
              padding: 10,
              borderRadius: 8,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{ textAlign: 'center', fontSize: 16, fontWeight: '900', color: 'white' }}
            >
              {completedTasks}
            </Text>
            <Text style={{ marginTop: 4, fontWeight: '500', color: 'white' }}>tareas completadas</Text>
          </View>
        </View>
      </View>

      <LineChart
        data={{
          labels: ['Tareas por hacer', 'Tareas completadas'],
          style: {
            fontWeight: '600'
          },
          datasets: [
            {
              data: [pendingTasks, completedTasks],
            },
          ],
        }}
        width={Dimensions.get('window').width - 20}
        height={220}
        yAxisInterval={2}
        chartConfig={{
          backgroundColor: '#aaa3e3',
          backgroundGradientFrom: '#a3b1e3',
          backgroundGradientTo: '#667ac2',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#667ac2',
          },
        }}
        bezier
        style={{
          borderRadius: 16,
        }}
      />

      <Text style={{ fontWeight: 'bold', marginTop: 20 }}>Logros conseguidos</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
        {achievements.map((achievement, index) => (
          <Pressable
            key={index}
            style={{
              width: '31%',
              aspectRatio: 1,
              backgroundColor: achievement.achieved ? '#FFF' : '#b1c3f1',
              padding: 10,
              borderRadius: 8,
              marginVertical: 5,
              marginHorizontal: '1%',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: achievement.achieved ? 2 : 0,
              borderColor: achievement.achieved ? '#b1c3f1' : 'transparent',
            }}
          >
            {achievement.achieved ? (
              <>
                <Ionicons name="medal-outline" size={24} color={achievement.medalColor} />
                <Text style={{ fontWeight: 'bold', color: achievement.textColor }}>{achievement.text}</Text>
              </>
            ) : (
              <AntDesign name='questioncircleo' size={24} color='#FFFFFF' />
            )}
          </Pressable>
        ))}
      </View>


      <Pressable onPress={toggleOptions} style={{ position: 'absolute', top: 18, right: 15 }}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Ionicons name='settings-outline' size={24} color='black' />
        </Animated.View>
      </Pressable>

      <Animated.View style={{ opacity: fadeAnim, position: 'absolute', top: 50, right: 10 }}>
        {showOptions && (
          <View style={{ backgroundColor: 'white', padding: 15, borderRadius: 5, elevation: 5 }}>
            <TouchableOpacity activeOpacity={0.6} onPress={selectImage}>
              <Text style={{ fontSize: 16, marginBottom: 10, fontWeight: '400' }}>Personalizar perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.6} onPress={toggleDarkMode}>
              <Text style={{ fontSize: 16, marginBottom: 10, fontWeight: '400' }}>Cambiar a modo oscuro</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.6} onPress={handleLogout}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#ce6464' }}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

    </View>
  )
}

export default Index

const styles = StyleSheet.create({})
