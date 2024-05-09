import { Image, StyleSheet, Text, View, Dimensions, Pressable, Animated, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { LineChart } from 'react-native-chart-kit'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { decode as atob } from 'base-64'
import profileImage from '../profile/profile-image.jpg'
import * as ImagePicker from 'expo-image-picker'


const index = () => {
  const router = useRouter()
  const [completedTasks, setCompletedTasks] = useState(0)
  const [pendingTasks, setPendingTasks] = useState(0)
  const [showOptions, setShowOptions] = useState(false)
  const [rotation] = useState(new Animated.Value(0))
  const [fadeAnim] = useState(new Animated.Value(0))
  const [userId, setUserId] = useState(null)
  const [selectedImageUri, setSelectedImageUri] = useState(null)
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };


  useEffect(() => {
    checkAuthenticatedUser()
  }, [])

  useEffect(() => {
    if (userId) {
      retrieveSelectedImageUri()
    }
  }, [userId])

  const checkAuthenticatedUser = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken')
      if (token) {
        const decodedToken = JSON.parse(atob(token.split('.')[1]))
        const userId = decodedToken.userId
        setUserId(userId)
      } else {
        router.replace('/login')
      }
    } catch (error) {
      console.log(error)
    }
  }

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

  const fetchUserTaskData = async () => {
    try {
      if (!userId) return
      const response = await axios.get(`http://192.168.30.174:3000/users/${userId}/todos/count`)
      const { totalCompletedTodos, totalPendingTodos } = response.data
      setCompletedTasks(totalCompletedTodos)
      setPendingTasks(totalPendingTodos)
    } catch (error) {
      console.log('error', error)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchUserTaskData()
      const interval = setInterval(fetchUserTaskData, 3000)
      return () => clearInterval(interval)
    }
  }, [userId])

  console.log('completados:', completedTasks)
  console.log('pendientes:', pendingTasks)

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken')
      router.replace('/login')
    } catch (error) {
      console.log(error)
    }
  }

  const selectImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (permissionResult.granted === false) {
      alert('Necesitas dar permisos para seleccionar imagenes')
      return
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync()
    if (!pickerResult.cancelled && pickerResult.assets && pickerResult.assets.length > 0 && pickerResult.assets[0] !== null) {
      setSelectedImageUri(pickerResult.assets[0].uri)
      await saveSelectedImageUriToDatabase(pickerResult.assets[0].uri)
    }
  }



  const retrieveSelectedImageUri = async () => {
    try {
      const uri = await AsyncStorage.getItem(`selectedImageUri_${userId}`)
      if (uri !== null) {
        setSelectedImageUri(uri)
      } else {
        setSelectedImageUri(require('../profile/profile-image.jpg'))
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const saveSelectedImageUriToDatabase = async (uri) => {
    try {
      await AsyncStorage.setItem(`selectedImageUri_${userId}`, uri)
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
        <Text style={{ fontWeight: 'bold' }}>Resumen de tus estadísticas</Text>
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
          decimalPlaces: 2,
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
            <TouchableOpacity activeOpacity={0.6} onPress={() => { }}>
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

export default index

const styles = StyleSheet.create({})
