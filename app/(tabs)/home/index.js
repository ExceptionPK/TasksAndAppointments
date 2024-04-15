import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, ViewBase } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AntDesign } from '@expo/vector-icons';
import { BottomModal, ModalContent, ModalTitle, SlideAnimation } from 'react-native-modals';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import axios from 'axios'
import moment from "moment"

const index = () => {
  const [todos, setTodos] = useState([])
  const today = moment().format("Do MMMM")
  const [isModalVisible, setModalVisible] = useState(false)
  const [category, setCategory] = useState("Todas")
  const [todo, setTodo] = useState("")
  const [pendingTodos, setPendingTodos] = useState([])
  const [completedTodos, setCompletedTodos] = useState([])
  const [marked, setMarked] = useState(false)
  const suggestions = [
    {
      id: "0",
      todo: "Hacer ejercicio",
    },
    {
      id: "1",
      todo: "Comprar tomates",
    },
    {
      id: "3",
      todo: "Tomar pastilla",
    },
    {
      id: "4",
      todo: "Adrián Cartón 9:00",
    }
  ]

  const addTodo = async () => {
    try {
      const todoData = {
        title: todo,
        category: category,

      }
      axios.post("http://192.168.1.60:3000/todos/66101c893f899ce3920eab80", todoData).then((response) => {
        console.log(response)
      }).catch((error) => {
        console.log(error)
      })

      await getUserTodos()
      setModalVisible(false)
      setTodo("")
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    getUserTodos()
  }, [marked, isModalVisible])

  const getUserTodos = async () => {
    try {
      const response = await axios.get(`http://192.168.1.60:3000/users/66101c893f899ce3920eab80/todos`)

      console.log(response.data.todos)
      setTodos(response.data.todos)

      const fetchedTodos = response.data.todos || []
      const pending = fetchedTodos.filter((todo) => todo.status !== "completed")

      const completed = fetchedTodos.filter((todo) => todo.status === "completed")

      setPendingTodos(pending)
      setCompletedTodos(completed)
    } catch (error) {
      console.log(error)
    }
  }

  const markTodoAsCompleted = async (todoId) => {
    try {
      setMarked(true)
      const response = await axios.patch(`http://192.168.1.60:3000/todos/${todoId}/complete`)
      console.log(response.data)

      await getUserTodos();
    } catch (error) {
      console.log(error)
    }
  }

  const handleLogout = async () => {
    try {
      // Eliminar el token de autenticación almacenado
      await AsyncStorage.removeItem("authToken");
      // Redirigir al usuario a la pantalla de inicio de sesión
      router.replace("/login");
    } catch (error) {
      console.log(error);
    }
  }

  console.log("completed", completedTodos)
  console.log("pending", pendingTodos)

  return (
    <>
      <View style={{ marginHorizontal: 10, marginVertical: 10, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Pressable
          style={{
            backgroundColor: "#7799f9",
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>Todas</Text>
        </Pressable>

        <Pressable
          style={{
            backgroundColor: "#7799f9",
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>Trabajo</Text>
        </Pressable>

        <Pressable
          style={{
            backgroundColor: "#7799f9",
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            marginRight: "auto"
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>Personal</Text>
        </Pressable>

        <Pressable onPress={() => setModalVisible(!isModalVisible)}>
          <AntDesign name="pluscircle" size={30} color="#406ef2" />
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
        <View style={{ padding: 10 }}>
          {todos?.length > 0 ? (
            <View>
              {pendingTodos?.length > 0 && (<Text>Tareas por hacer {today}</Text>)}

              {pendingTodos?.map((item, index) => (
                <Pressable style={{ backgroundColor: "#e7edfd", padding: 10, borderRadius: 7, marginVertical: 10 }} key={index}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Entypo onPress={() => markTodoAsCompleted(item?._id)} name="circle" size={18} color="black" />
                    <Text style={{ flex: 1 }}>{item?.title}</Text>
                    <Ionicons name="flag-outline" size={20} color="black" />
                  </View>
                </Pressable>
              ))}

              {completedTodos?.length > 0 && (
                <View>
                  <View style={{ justifyContent: "center", alignItems: "center", margin: 10 }}>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginVertical: 10 }}>
                    <Text>Tareas completadas</Text>
                    <MaterialIcons name="arrow-drop-down" size={24} color="black" />
                  </View>


                  {completedTodos?.map((item, index) => (
                    <Pressable style={{ backgroundColor: "#e7edfd", padding: 10, borderRadius: 7, marginVertical: 10 }} key={index}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <FontAwesome name="circle" size={18} color="gray" />
                        <Text style={{ flex: 1, textDecorationLine: "line-through", color: "gray" }}>{item?.title}</Text>
                        <Ionicons name="flag-outline" size={20} color="gray" />
                      </View>
                    </Pressable>
                  ))}

                </View>
              )}
            </View>
          ) : (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 130, marginLeft: "auto", marginRight: "auto" }}>
              <Image
                style={{ width: 280, height: 280, left: 10, resizeMode: "contain" }}
                source={{ uri: "https://www.pngall.com/wp-content/uploads/8/Task-List.png" }}
              />
              <Text style={{ fontSize: 18, marginTop: 15, fontWeight: "700", textAlign: "center" }}>No hay tareas disponibles. ¡Añade una tarea!</Text>
            </View>
          )}
        </View>
      </ScrollView>


      <BottomModal
        onBackdropPress={() => setModalVisible(!isModalVisible)}
        onHardwareBackPress={() => setModalVisible(!isModalVisible)}
        swipeDirection={["up", "down"]}
        swipeThreshold={200}
        modalTitle={<ModalTitle title='Añadir una tarea' />}
        modalAnimation={
          new SlideAnimation({
            slideFrom: "bottom",
          })
        }
        visible={isModalVisible}
        onTouchOutside={() => setModalVisible(!isModalVisible)}
      >
        <ModalContent style={{ width: "100%", height: 280 }}>
          <View style={{ marginVertical: 10, flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TextInput
              value={todo}
              onChangeText={(text) => setTodo(text)}
              placeholder='Escribe una nueva tarea'
              style={{ padding: 10, borderColor: "#e0e0e0", borderWidth: 1, borderRadius: 5, flex: 1 }}
            />
            <Ionicons onPress={addTodo} name="send" size={30} color="#406ef2" />
          </View>

          <Text>Elige la categoría</Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 10 }}>
            <Pressable
              onPress={() => setCategory("Trabajo")}
              style={{
                borderColor: "#e0e0e0",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderWidth: 1,
                borderRadius: 10
              }}>
              <Text>Trabajo</Text>
            </Pressable>
            <Pressable
              onPress={() => setCategory("Personal")}
              style={{
                borderColor: "#e0e0e0",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderWidth: 1,
                borderRadius: 10
              }}>
              <Text>Personal</Text>
            </Pressable>
            <Pressable
              onPress={() => setCategory("Ideas")}
              style={{
                borderColor: "#e0e0e0",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderWidth: 1,
                borderRadius: 10
              }}>
              <Text>Ideas</Text>
            </Pressable>
          </View>

          <Text>Sugerencias</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap", marginVertical: 10 }}>
            {suggestions?.map((item, index) => (
              <Pressable onPress={() => setTodo(item?.todo)} style={{ backgroundColor: "#f0f8ff", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }} key={index}>
                <Text style={{ textAlign: "center" }}>{item?.todo}</Text>
              </Pressable>
            ))}
          </View>
        </ModalContent>
      </BottomModal>
    </>
  )
}

export default index

const styles = StyleSheet.create({})