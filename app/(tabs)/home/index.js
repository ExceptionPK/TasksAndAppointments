import { Modal, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, TouchableOpacity, ToastAndroid, LogBox } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AntDesign } from '@expo/vector-icons'
import { BottomModal, ModalContent, ModalTitle, SlideAnimation } from 'react-native-modals'
import { Ionicons } from '@expo/vector-icons'
import { MaterialIcons, FontAwesome } from '@expo/vector-icons'
import { Entypo } from '@expo/vector-icons'
import axios from 'axios'
import moment from 'moment'
import 'moment/locale/es'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { decode as atob } from 'base-64'
import { SwipeListView } from 'react-native-swipe-list-view'
import { SimpleLineIcons } from '@expo/vector-icons';
LogBox.ignoreLogs(['VirtualizedLists should never be nested'])

const index = () => {
  const router = useRouter()
  const [todos, setTodos] = useState([])
  const today = moment().locale('es').format('DD/MM/YYYY')
  const [isModalVisible, setModalVisible] = useState(false)
  const [category, setCategory] = useState('Todas')
  const [todo, setTodo] = useState('')
  const [pendingTodos, setPendingTodos] = useState([])
  const [completedTodos, setCompletedTodos] = useState([])
  const [marked, setMarked] = useState(false)
  const [taskFlags, setTaskFlags] = useState({})
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [userId, setUserId] = useState(null)

  const suggestions = [
    { id: '0', todo: 'Hacer ejercicio' },
    { id: '1', todo: 'Comprar tomates' },
    { id: '3', todo: 'Tomar pastilla' },
    { id: '4', todo: 'Realizar vista del perfil' },
    { id: '5', todo: 'Hacer powerpoint de TFG' },
    { id: '6', todo: 'Realizar documentación' },
  ]

  useEffect(() => {
    checkAuthenticatedUser()
  }, [])

  const addTodo = async () => {
    try {
      if (!todo.trim()) {
        ToastAndroid.show('Por favor, escribe una tarea primero.', ToastAndroid.SHORT)
        return
      }

      const todoData = {
        title: todo,
        category: category,
      }

      const response = await axios.post(`http://192.168.30.174:3000/todos/${userId}`, todoData)

      console.log(response.data)

      const newTodo = response.data.todo

      setTodos([...todos, newTodo])

      if (newTodo && newTodo.status === 'completed') {
        setCompletedTodos([...completedTodos, newTodo])
      } else {
        setPendingTodos([...pendingTodos, newTodo])
      }

      setModalVisible(false)
      setTodo('')
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (userId) {
      getUserTodos()
    }
  }, [userId, marked, category])

  useEffect(() => {
    if (!isModalVisible) {
      loadTaskFlags()
    }
  }, [isModalVisible])

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

  const getUserTodos = async () => {
    try {
      const response = await axios.get(`http://192.168.30.174:3000/users/${userId}/todos`)

      const allTodos = response.data.todos || []
      setTodos(allTodos)

      const filteredTodos = category === 'Todas' ? allTodos : allTodos.filter(todo => todo.category === category)

      const pending = filteredTodos.filter((todo) => todo.status !== 'completed')
      const completed = filteredTodos.filter((todo) => todo.status === 'completed')

      setPendingTodos(pending)
      setCompletedTodos(completed)
    } catch (error) {
      console.log(error)
    }
  }

  const markTodoAsCompleted = async (todoId) => {
    try {
      setMarked(true)
      const response = await axios.patch(`http://192.168.30.174:3000/todos/${todoId}/complete`)
      console.log(response.data)

      await getUserTodos()
    } catch (error) {
      console.log(error)
    }
  }

  const deleteTodo = async (todoId) => {
    try {
      const response = await axios.delete(`http://192.168.30.174:3000/todos/${todoId}`)
      console.log(response.data)

      await getUserTodos()
    } catch (error) {
      console.log(error)
    }
  }

  const deleteAllTodos = async () => {
    try {
      const response = await axios.delete(`http://192.168.30.174:3000/todos/delete-all/${userId}`)
      console.log(response.data)
      await getUserTodos()
    } catch (error) {
      console.log(error)
    }
  }

  console.log('completed', completedTodos)
  console.log('pending', pendingTodos)

  const toggleFlag = async (taskId) => {
    try {
      const updatedFlags = { ...taskFlags, [taskId]: !taskFlags[taskId] }
      setTaskFlags(updatedFlags)
      await AsyncStorage.setItem(taskId, updatedFlags[taskId] ? 'true' : 'false')
    } catch (error) {
      console.log(error)
    }
  }

  const loadTaskFlags = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys()
      const storedFlags = {}
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key)
        storedFlags[key] = value === 'true'
      }
      setTaskFlags(storedFlags)
    } catch (error) {
      console.log(error)
    }
  }

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory)
  }

  return (
    <>
      <View style={{ marginHorizontal: 10, marginVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable style={[styles.categoryButton, category === 'Todas' && styles.activeCategoryButton]} onPress={() => handleCategoryChange('Todas')}>
          <Text style={styles.categoryButtonText}>Todas</Text>
        </Pressable>
        <Pressable style={[styles.categoryButton, category === 'Trabajo' && styles.activeCategoryButton]} onPress={() => handleCategoryChange('Trabajo')}>
          <Text style={styles.categoryButtonText}>Trabajo</Text>
        </Pressable>
        <Pressable style={[styles.categoryButton, category === 'Personal' && styles.activeCategoryButton]} onPress={() => handleCategoryChange('Personal')}>
          <Text style={styles.categoryButtonText}>Personal</Text>
        </Pressable>

        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => setShowConfirmationModal(true)}
          style={{ alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' }}
        >

          <MaterialCommunityIcons name='delete-circle' size={35} color='#ce6464' />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setModalVisible(!isModalVisible)} activeOpacity={0.6}>
          <AntDesign name='pluscircle' size={30} color='#6689ee' />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ padding: 10 }}>
          {pendingTodos?.length > 0 || completedTodos?.length > 0 ? (
            <View>
              {pendingTodos?.length > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 5 }}>
                  <Text style={{ fontWeight: '900' }}>Tareas por hacer | {today}</Text>
                  <MaterialIcons name='arrow-drop-down' size={24} color='black' />
                </View>
              )}

              <SwipeListView
                data={pendingTodos}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <Pressable
                    style={{ backgroundColor: '#e7edfd', padding: 10, borderRadius: 7, marginVertical: 5 }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <TouchableOpacity onPress={() => markTodoAsCompleted(item?._id)} activeOpacity={0.5}>
                        <Entypo name='circle' size={18} color='black' />
                      </TouchableOpacity>
                      <Text style={{ flex: 1, fontWeight: '500' }}>{item?.title}</Text>
                      <TouchableOpacity
                        onPress={() => {
                          router?.push({
                            pathname: '/home/info',
                            params: {
                              id: item._id,
                              title: item?.title,
                              category: item?.category,
                              createdAt: item?.createdAt,
                              dueDate: item?.dueDate,
                            },
                          })
                        }}
                      >
                        <SimpleLineIcons name="pencil" size={23} color="black" style={{ marginRight: 3 }} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => toggleFlag(item._id)} activeOpacity={0.3}>
                        <Ionicons
                          name={taskFlags[item._id] ? 'flag' : 'flag-outline'}
                          size={25}
                          color={taskFlags[item._id] ? '#ce6464' : 'black'}
                        />
                      </TouchableOpacity>
                    </View>
                  </Pressable>
                )}
                renderHiddenItem={({ item }) => (
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <TouchableOpacity onPress={() => deleteTodo(item._id)} style={{ backgroundColor: '#ce6464', borderRadius: 7, justifyContent: 'center', alignItems: 'center', padding: 10 }}>
                      <Text style={{ color: 'white', fontWeight: 'bold' }}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                )}
                leftOpenValue={0}
                rightOpenValue={-75}
              />


              {completedTodos?.length > 0 && (
                <View style={{ marginTop: 20 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginVertical: 5 }}>
                    <Text style={{ fontWeight: '900', marginRight: 'auto' }}>Tareas completadas | {today}</Text>
                    <MaterialIcons name='arrow-drop-down' size={24} color='black' />
                  </View>

                  <SwipeListView
                    data={completedTodos}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                      <Pressable style={{ backgroundColor: '#e7edfd', padding: 10, borderRadius: 7, marginVertical: 5 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <FontAwesome name='circle' size={18} color='gray' />
                          <Text style={{ flex: 1, textDecorationLine: 'line-through', color: 'gray', fontWeight: '500' }}>{item?.title}</Text>
                        </View>
                      </Pressable>
                    )}
                    renderHiddenItem={({ item }) => (
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <TouchableOpacity onPress={() => deleteTodo(item._id)} style={{ backgroundColor: '#ce6464', borderRadius: 7, justifyContent: 'center', alignItems: 'center', padding: 10 }}>
                          <Text style={{ color: 'white', fontWeight: 'bold' }}>Eliminar</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    leftOpenValue={0}
                    rightOpenValue={-75}
                  />

                </View>
              )}

            </View>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 130, marginLeft: 'auto', marginRight: 'auto' }}>
              <Image
                style={{ width: 280, height: 280, left: 10, resizeMode: 'contain' }}
                source={{ uri: 'https://www.pngall.com/wp-content/uploads/8/Task-List.png' }}
              />
              <Text style={{ fontSize: 18, marginTop: 15, fontWeight: '700', textAlign: 'center' }}>No hay tareas disponibles en esta categoría. ¡Añade una tarea!</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ padding: 10 }}>
          {pendingTodos?.length > 0 || completedTodos?.length > 0 ? (
            <View>
              {pendingTodos?.length > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 5 }}>
                  <Text style={{ fontWeight: '900' }}>Tareas por hacer | {today}</Text>
                  <MaterialIcons name='arrow-drop-down' size={24} color='black' />
                </View>
              )}

              {pendingTodos?.map((item, index) => (
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={() => {
                    router?.push({
                      pathname: '/home/info',
                      params: {
                        id: item._id,
                        title: item?.title,
                        category: item?.category,
                        createdAt: item?.createdAt,
                        dueDate: item?.dueDate,
                      },
                    })
                  }}
                  style={{ backgroundColor: '#e7edfd', padding: 10, borderRadius: 7, marginVertical: 5 }} key={index}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>

                    <TouchableOpacity onPress={() => markTodoAsCompleted(item?._id)} activeOpacity={0.5}>
                      <Entypo name='circle' size={18} color='black' />
                    </TouchableOpacity>
                    <Text style={{ flex: 1, fontWeight: '500' }}>{item?.title}</Text>

                    <TouchableOpacity onPress={() => toggleFlag(item._id)} activeOpacity={0.3}>
                      <Ionicons
                        name={taskFlags[item._id] ? 'flag' : 'flag-outline'}
                        size={25}
                        color={taskFlags[item._id] ? '#ce6464' : 'black'}

                      />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => deleteTodo(item._id)} activeOpacity={0.3}>

                      <MaterialIcons
                        name='delete-outline'
                        size={25}
                        color='#ce6464'
                        style={{ left: 5 }}
                      />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}

              {completedTodos?.length > 0 && (
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginVertical: 5, marginTop: 20 }}>
                    <Text style={{ fontWeight: '900', marginRight: 'auto' }}>Tareas completadas</Text>
                    <MaterialIcons name='arrow-drop-down' size={24} color='black' />
                  </View>
                  {completedTodos?.map((item, index) => (
                    <Pressable style={{ backgroundColor: '#e7edfd', padding: 10, borderRadius: 7, marginVertical: 5 }} key={index}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <FontAwesome name='circle' size={18} color='gray' />
                        <Text style={{ flex: 1, textDecorationLine: 'line-through', color: 'gray', fontWeight: '500' }}>{item?.title}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 130, marginLeft: 'auto', marginRight: 'auto' }}>
              <Image
                style={{ width: 280, height: 280, left: 10, resizeMode: 'contain' }}
                source={{ uri: 'https://www.pngall.com/wp-content/uploads/8/Task-List.png' }}
              />
              <Text style={{ fontSize: 18, marginTop: 15, fontWeight: '700', textAlign: 'center' }}>No hay tareas disponibles en esta categoría. ¡Añade una tarea!</Text>
            </View>
          )}
        </View>
      </ScrollView> */}



      <BottomModal
        onBackdropPress={() => setModalVisible(false)}
        onHardwareBackPress={() => setModalVisible(false)}
        swipeDirection={['up', 'down']}
        swipeThreshold={200}
        modalTitle={<ModalTitle titleStyle={{ fontWeight: '900' }} title='Añadir una tarea' />}
        modalAnimation={new SlideAnimation({ slideFrom: 'bottom' })}
        visible={isModalVisible}
        onTouchOutside={() => setModalVisible(false)}
        onSwipeOut={() => setModalVisible(false)}
      >
        <ModalContent style={{ width: '100%', height: 280 }}>
          <View style={{ marginVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TextInput
              value={todo}
              onChangeText={(text) => setTodo(text)}
              placeholder='Escribe una nueva tarea'
              style={{ padding: 10, borderColor: '#e0e0e0', borderWidth: 1, borderRadius: 5, flex: 1, fontWeight: '500' }}
            />
            <TouchableOpacity activeOpacity={0.6} onPress={addTodo}>
              <Ionicons style={{ left: 5 }} name='send' size={30} color='#6689ee' />
            </TouchableOpacity>

          </View>

          <Text style={{ fontWeight: '700' }}>Elige la categoría</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 10 }}>
            <Pressable
              style={[styles.categoryButtonModal, category === 'Todas' && styles.activeCategoryButtonModal]} onPress={() => handleCategoryChange('Todas')}
            >
              <Text style={{ fontWeight: '500' }}>Todas</Text>
            </Pressable>
            <Pressable
              style={[styles.categoryButtonModal, category === 'Trabajo' && styles.activeCategoryButtonModal]} onPress={() => handleCategoryChange('Trabajo')}
            >
              <Text style={{ fontWeight: '500' }}>Trabajo</Text>
            </Pressable>
            <Pressable
              style={[styles.categoryButtonModal, category === 'Personal' && styles.activeCategoryButtonModal]} onPress={() => handleCategoryChange('Personal')}
            >
              <Text style={{ fontWeight: '500' }}>Personal</Text>
            </Pressable>
          </View>

          <Text style={{ fontWeight: '700', marginTop: 10 }}>Sugerencias</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginVertical: 10 }}>
            {suggestions.map((item, index) => (
              <TouchableOpacity activeOpacity={0.6} key={index} onPress={() => setTodo(item.todo)} style={{ backgroundColor: '#f0f8ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                <Text style={{ textAlign: 'center', fontWeight: '500' }}>{item.todo}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ModalContent>
      </BottomModal>

      <Modal
        visible={showConfirmationModal}
        transparent={true}
        animationType='fade'
        onRequestClose={() => setShowConfirmationModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {pendingTodos.length > 0 || completedTodos.length > 0 ? (
              <>
                <Text style={[styles.modalMessage, { fontWeight: '900', textAlign: 'center' }]}>¿Quieres eliminar todas las tareas?</Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.yesButton]}
                    onPress={() => {
                      setShowConfirmationModal(false)
                      deleteAllTodos()
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modalButtonText}>Sí</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.noButton]}
                    onPress={() => setShowConfirmationModal(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modalButtonText}>No</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.modalMessage, { fontWeight: '900', textAlign: 'center' }]}>No hay tareas para eliminar.</Text>
                <View style={{ marginTop: 10 }}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#7799f9' }]}
                    onPress={() => setShowConfirmationModal(false)}
                    activeOpacity={0.7}
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
  },
  categoryButton: {
    backgroundColor: '#bfbfbf',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeCategoryButton: {
    backgroundColor: '#6689ee',
  },
  categoryButtonText: {
    fontWeight: '600',
    color: 'white',
  },
  categoryButtonModal: {
    borderColor: '#e0e0e0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderRadius: 10
  },
  activeCategoryButtonModal: {
    backgroundColor: '#e7e6e6',
  }
})