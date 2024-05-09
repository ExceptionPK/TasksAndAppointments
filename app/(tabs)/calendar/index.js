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

  useEffect(() => {
    checkAuthenticatedUser()
  }, [])

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

  useEffect(() => {
    if (userId) {
      fetchCompletedTodos()
      const interval = setInterval(fetchCompletedTodos, 3000)
      return () => clearInterval(interval)
    }
  }, [selectedDate, userId])

  const fetchCompletedTodos = async () => {
    try {
      if (!userId) return
      const response = await axios.get(
        `http://192.168.30.174:3000/users/${userId}/todos/completed/${selectedDate}`
      )

      const completedTodos = response.data.completedTodos || []
      setTodos(completedTodos)
    } catch (error) {
      console.log('error', error)
    }
  }

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString)
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
