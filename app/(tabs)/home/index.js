import { Modal, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, ViewBase, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { AntDesign } from '@expo/vector-icons';
import { BottomModal, ModalContent, ModalTitle, SlideAnimation } from 'react-native-modals';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import axios from 'axios';
import moment from "moment";
import 'moment/locale/es';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const index = () => {
  const router = useRouter();
  const [todos, setTodos] = useState([])
  const today = moment().locale('es').format("D [de] MMMM [de] YYYY")
  const [isModalVisible, setModalVisible] = useState(false)
  const [category, setCategory] = useState("Todas")
  const [todo, setTodo] = useState("")
  const [pendingTodos, setPendingTodos] = useState([])
  const [completedTodos, setCompletedTodos] = useState([])
  const [marked, setMarked] = useState(false)
  const [taskFlags, setTaskFlags] = useState({});
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);


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
      todo: "Realizar vista del perfil",
    },
    {
      id: "5",
      todo: "Hacer powerpoint de TFG",
    },
    {
      id: "6",
      todo: "Realizar documentación",
    },
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
    loadTaskFlags()
  }, [marked, isModalVisible])

  const getUserTodos = async () => {
    try {
      const response = await axios.get(`http://192.168.1.60:3000/users/66101c893f899ce3920eab80/todos`)

      setTodos(response.data.todos || []);

      const pending = response.data.todos.filter((todo) => todo.status !== "completed");
      const completed = response.data.todos.filter((todo) => todo.status === "completed");

      setPendingTodos(pending);
      setCompletedTodos(completed);

      const initialFlags = {};
      response.data.todos.forEach(todo => {
        initialFlags[todo._id] = false;
      });
      setTaskFlags(initialFlags);
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

  const deleteTodo = async (todoId) => {
    try {
      const response = await axios.delete(`http://192.168.1.60:3000/todos/${todoId}`);
      console.log(response.data);

      await getUserTodos();
    } catch (error) {
      console.log(error);
    }
  }

  const deleteAllTodos = async () => {
    try {
      const response = await axios.delete(`http://192.168.1.60:3000/todos/delete-all/66101c893f899ce3920eab80`);
      console.log(response.data);
      await getUserTodos();
    } catch (error) {
      console.log(error);
    }
  };


  console.log("completed", completedTodos)
  console.log("pending", pendingTodos)

  const toggleFlag = async (taskId) => {
    try {
      const updatedFlags = { ...taskFlags, [taskId]: !taskFlags[taskId] };
      setTaskFlags(updatedFlags);
      await AsyncStorage.setItem(taskId, updatedFlags[taskId] ? 'true' : 'false');
    } catch (error) {
      console.log(error);
    }
  };

  const loadTaskFlags = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const storedFlags = {};
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        storedFlags[key] = value === 'true';
      }
      setTaskFlags(storedFlags);
    } catch (error) {
      console.log(error);
    }
  };



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
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>Sugerencias</Text>
        </Pressable>

        <Pressable
          onPress={() => setShowConfirmationModal(true)}
          style={{
            backgroundColor: "#f36259",
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            marginRight: "auto"
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>Eliminar tareas</Text>
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
                <Pressable
                  onPress={() => {
                    router?.push({
                      pathname: "/home/info",
                      params: {
                        id: item._id,
                        title: item?.title,
                        category: item?.category,
                        createdAt: item?.createdAt,
                        dueDate: item?.dueDate,
                      },
                    });
                  }}
                  style={{ backgroundColor: "#e7edfd", padding: 10, borderRadius: 7, marginVertical: 10 }} key={index}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Entypo onPress={() => markTodoAsCompleted(item?._id)} name="circle" size={18} color="black" />
                    <Text style={{ flex: 1 }}>{item?.title}</Text>
                    <MaterialIcons
                      name="delete-outline"
                      size={25}
                      color="#ce6464"
                      onPress={() => deleteTodo(item._id)}
                    />
                    <Ionicons
                      name={taskFlags[item._id] ? "flag" : "flag-outline"}
                      size={25}
                      color={taskFlags[item._id] ? "#ce6464" : "black"}
                      onPress={() => toggleFlag(item._id)}
                    />

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
                        <Ionicons name="flag-outline" size={25} color="gray" />
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

      <Modal
        visible={showConfirmationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmationModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {pendingTodos.length > 0 || completedTodos.length > 0 ? (
              <>
                <Text style={[styles.modalMessage, { fontWeight: 'bold', textAlign: 'center' }]}>¿Quieres eliminar todas las tareas?</Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.yesButton]}
                    onPress={() => {
                      setDeleteConfirmation(true);
                      deleteAllTodos();
                      setShowConfirmationModal(false);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Sí</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.noButton]}
                    onPress={() => setShowConfirmationModal(false)}
                  >
                    <Text style={styles.modalButtonText}>No</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.modalMessage, { fontWeight: 'bold', textAlign: 'center' }]}>No hay tareas para eliminar.</Text>
                <View style={{ marginTop: 10 }}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#7799f9' }]}
                    onPress={() => setShowConfirmationModal(false)}
                  >
                    <Text style={styles.modalButtonText}>Ok</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  )
}

export default index

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
  modalMessage: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    padding: 11,
    borderRadius: 5,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  yesButton: {
    flex: 1,
    backgroundColor: '#f36259',
    marginRight: 5,
  },
  noButton: {
    flex: 1,
    backgroundColor: '#7799f9',
    marginLeft: 5,
  }
})