import { Image, StyleSheet, Text, View, Dimensions, Pressable, Animated } from "react-native"
import React, { useState, useEffect } from "react"
import axios from "axios"
import { LineChart } from "react-native-chart-kit"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { SimpleLineIcons } from '@expo/vector-icons'
import { Ionicons } from '@expo/vector-icons'

const index = () => {
  const router = useRouter()
  const [completedTasks, setCompletedTasks] = useState(0)
  const [pendingTasks, setPendingTasks] = useState(0)
  const [showOptions, setShowOptions] = useState(false)
  const [rotation] = useState(new Animated.Value(0))
  const [fadeAnim] = useState(new Animated.Value(0))

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

  const fetchTaskData = async () => {
    try {
      const response = await axios.get("http://192.168.1.60:3000/todos/count")
      const { totalCompletedTodos, totalPendingTodos } = response.data
      setCompletedTasks(totalCompletedTodos)
      setPendingTasks(totalPendingTodos)
    } catch (error) {
      console.log("error", error)
    }
  }

  useEffect(() => {
    fetchTaskData()
    const interval = setInterval(fetchTaskData, 3000)
    return () => clearInterval(interval)
  }, [])

  console.log("comp", completedTasks)
  console.log("pending", pendingTasks)

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("authToken")
      router.replace("/login")
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <View style={{ padding: 10, flex: 1, backgroundColor: "white" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Image
          style={{ width: 60, height: 60, borderRadius: 30 }}
          source={{
            uri: "https://i.pinimg.com/originals/d8/7c/fb/d87cfb5fd74a981039da6c8803c23d67.jpg",
          }}
        />
        <View>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>
            Planifica tus tareas con tiempo
          </Text>
          <Text style={{ fontSize: 15, color: "gray", marginTop: 4 }}>
            Selecciona las categorias
          </Text>
        </View>
      </View>

      <View style={{ marginVertical: 12 }}>
        <Text style={{ fontWeight: "bold" }}>Resumen de estadísticas</Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginVertical: 8,
          }}
        >

          <View
            style={{
              backgroundColor: "#b1c3f1",
              padding: 10,
              borderRadius: 8,
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{ textAlign: "center", fontSize: 16, fontWeight: "900" }}
            >
              {pendingTasks}
            </Text>
            <Text style={{ marginTop: 4, fontWeight: "500" }}>tareas por hacer</Text>
          </View>
          <View
            style={{
              backgroundColor: "#b1c3f1",
              padding: 10,
              borderRadius: 8,
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{ textAlign: "center", fontSize: 16, fontWeight: "900" }}
            >
              {completedTasks}
            </Text>
            <Text style={{ marginTop: 4, fontWeight: "500" }}>tareas completadas</Text>
          </View>
        </View>
      </View>

      <LineChart
        data={{
          labels: ["Tareas por hacer", "Tareas completadas"],
          style: {
            fontWeight: "600"
          },
          datasets: [
            {
              data: [pendingTasks, completedTasks],
            },
          ],
        }}
        width={Dimensions.get("window").width - 20}
        height={220}
        yAxisInterval={2}
        chartConfig={{
          backgroundColor: "#aaa3e3",
          backgroundGradientFrom: "#a3b1e3",
          backgroundGradientTo: "#667ac2",
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#667ac2",
          },
        }}
        bezier
        style={{
          borderRadius: 16,
        }}
      />

      <Pressable onPress={toggleOptions} style={{ position: 'absolute', top: 18, right: 15 }}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Ionicons name="settings-outline" size={24} color="black" />
        </Animated.View>
      </Pressable>

      <Animated.View style={{ opacity: fadeAnim, position: "absolute", top: 50, right: 10 }}>
        {showOptions && (
          <View style={{ backgroundColor: "white", padding: 15, borderRadius: 5, elevation: 5 }}>
            <Pressable onPress={() => { }}>
              <Text style={{ fontSize: 16, marginBottom: 10, fontWeight:"400" }}>Personalizar perfil</Text>
            </Pressable>
            <Pressable onPress={() => { }}>
              <Text style={{ fontSize: 16, marginBottom: 10, fontWeight:"400" }}>Cambiar a modo oscuro</Text>
            </Pressable>
            <Pressable onPress={handleLogout}>
              <Text style={{ fontSize: 16, fontWeight: "900", color: "#ce6464" }}>Cerrar sesión</Text>
            </Pressable>
          </View>
        )}
      </Animated.View>

    </View>
  )
}

export default index

const styles = StyleSheet.create({})
