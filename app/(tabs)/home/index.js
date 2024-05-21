import { Modal, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, TouchableOpacity, ToastAndroid, LogBox } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
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
import { Calendar } from 'react-native-calendars'
import * as Animatable from 'react-native-animatable'
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
  const [completedCollapsed, setCompletedCollapsed] = useState(false)
  const [pendingCollapsed, setPendingCollapsed] = useState(false)
  const [iconChanges, setIconChanges] = useState({})
  const [selectedDate, setSelectedDate] = useState(null)
  const [isCalendarVisible, setCalendarVisible] = useState(false)
  const [loading, setLoading] = useState(false)


  // Array de sugerencias para autocompletar más rapido las tareas
  const suggestions = [
    { id: '0', todo: 'Hacer ejercicio' },
    { id: '1', todo: 'Comprar tomates' },
    { id: '3', todo: 'Tomar pastilla' },
    { id: '4', todo: 'Realizar vista del perfil' },
    { id: '5', todo: 'Hacer powerpoint de TFG' },
    { id: '6', todo: 'Realizar documentación' },
  ]

  // Efecto que se ejecuta al cargar el componente para verificar el usuario autenticado 
  //y recuperar el estado de colapso de las tareas completadas y pendientes, recupera el estado de los iconos de edición
  useEffect(() => {
    checkAuthenticatedUser()
    retrieveCompletedCollapsedState()
    retrievePendingCollapsedState()
    retrieveIconChanges()
  }, [])

  const imageRef = useRef(null)

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Verificar que la referencia a la imagen no sea null antes de llamar a shake
      if (imageRef.current) {
        imageRef.current.swing(1500) // Duración de la vibración en milisegundos
      }
    }, 5000) // Intervalo de 10 segundos

    // Limpiar el intervalo cuando el componente se desmonte para evitar fugas de memoria
    return () => clearInterval(intervalId)
  }, [])

  // Efecto que se ejecuta cada vez que cambia el ID de usuario, el estado de marcado o la categoría de las tareas
  useEffect(() => {
    if (userId) {
      getUserTodos()
    }
  }, [userId, marked, category])

  // Efecto que se ejecuta cada vez que cambia el estado de visibilidad del modal
  useEffect(() => {
    if (!isModalVisible) {
      loadTaskFlags()
    }
  }, [isModalVisible])

  // Función para alternar el estado de colapso de las tareas completadas
  const toggleCompletedCollapse = () => {
    setCompletedCollapsed(!completedCollapsed)
    AsyncStorage.setItem('completedCollapsed', JSON.stringify(!completedCollapsed))
  }

  // Función para recuperar el estado de colapso de las tareas completadas del almacenamiento local
  const retrieveCompletedCollapsedState = async () => {
    try {
      const value = await AsyncStorage.getItem('completedCollapsed')
      if (value !== null) {
        setCompletedCollapsed(JSON.parse(value))
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Función para recuperar el estado de colapso de las tareas pendientes del almacenamiento local
  const togglePendingCollapse = () => {
    setPendingCollapsed(!pendingCollapsed)
    AsyncStorage.setItem('pendingCollapsed', JSON.stringify(!pendingCollapsed))
  }

  // Función para recuperar el estado de colapso de las tareas pendientes del almacenamiento local
  const retrievePendingCollapsedState = async () => {
    try {
      const value = await AsyncStorage.getItem('pendingCollapsed')
      if (value !== null) {
        setPendingCollapsed(JSON.parse(value))
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Función para agregar una nueva tarea
  const addTodo = async () => {
    setLoading(true)
    try {
      // Verificar si la tarea está vacía o contiene solo espacios en blanco
      if (!todo.trim()) {
        ToastAndroid.show('Por favor, escribe una tarea primero.', ToastAndroid.SHORT)
        setLoading(false)
        return
      }

      const todoData = {
        title: todo,
        category: category,
      }

      // Enviar una solicitud para agregar una nueva tarea al servidor
      const response = await axios.post(`http://apita.onrender.com/todos/${userId}`, todoData)

      console.log(response.data)

      // Agregar la nueva tarea a la lista de tareas
      const newTodo = response.data.todo

      setTodos([...todos, newTodo])

      if (newTodo && newTodo.status === 'completed') {
        setCompletedTodos([...completedTodos, newTodo])
      } else {
        setPendingTodos([...pendingTodos, newTodo])
      }

      setModalVisible(false)
      setLoading(false)
      setTodo('')
    } catch (error) {
      console.log(error)
    }
  }

  // Función para verificar si el usuario está autenticado
  const checkAuthenticatedUser = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken') // Obtener el token de autenticación del almacenamiento local
      if (token) {
        const decodedToken = JSON.parse(atob(token.split('.')[1]))
        const userId = decodedToken.userId
        setUserId(userId)
      } else {
        router.replace('/login') // Redirigir al usuario a la página de inicio de sesión si no hay token
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Función para obtener las tareas del usuario
  const getUserTodos = async () => {
    try {
      // Obtener las tareas del usuario desde el servidor
      const response = await axios.get(`http://apita.onrender.com/users/${userId}/todos`)

      const allTodos = response.data.todos || [] // Obtener todas las tareas del usuario
      setTodos(allTodos)

      // Filtrar las tareas según la categoría seleccionada
      const filteredTodos = category === 'Todas' ? allTodos : allTodos.filter(todo => todo.category === category)

      // Separar las tareas pendientes de las completadas
      const pending = filteredTodos.filter((todo) => todo.status !== 'completed')
      const completed = filteredTodos.filter((todo) => todo.status === 'completed')

      // Establecer las tareas pendientes y completadas en el estado
      setPendingTodos(pending)
      setCompletedTodos(completed)
    } catch (error) {
      console.log(error)
    }
  }

  // Función para marcar una tarea como completada
  const markTodoAsCompleted = async (todoId) => {
    try {
      setMarked(true)
      // Enviar una solicitud para marcar la tarea como completada al servidor
      const response = await axios.patch(`http://apita.onrender.com/todos/${todoId}/complete`)
      console.log(response.data)

      await getUserTodos() // Actualizar las tareas del usuario después de marcar una como completada
    } catch (error) {
      console.log(error)
    }
  }

  // Función para eliminar una tarea
  const deleteTodo = async (todoId) => {
    try {
      // Enviar una solicitud para eliminar la tarea al servidor
      const response = await axios.delete(`http://apita.onrender.com/todos/${todoId}`)
      console.log(response.data)
      await getUserTodos() // Actualizar las tareas del usuario después de eliminar una
    } catch (error) {
      console.log(error)
    }
  }

  // Función para eliminar todas las tareas del usuario
  const deleteAllTodos = async () => {
    try {
      const response = await axios.delete(`http://apita.onrender.com/todos/delete-all/${userId}`)
      console.log(response.data)
      await getUserTodos()
    } catch (error) {
      console.log(error)
    }
  }

  console.log('completados:', completedTodos)
  console.log('pendientes:', pendingTodos)

  // Función para cambiar el estado de la bandera de una tarea
  const toggleFlag = async (taskId) => {
    try {
      // Actualizar las banderas de las tareas
      const updatedFlags = { ...taskFlags, [taskId]: !taskFlags[taskId] }
      setTaskFlags(updatedFlags) // Establecer las banderas actualizadas en el estado
      await AsyncStorage.setItem(taskId, updatedFlags[taskId] ? 'true' : 'false') // Guardar las banderas en el almacenamiento local
    } catch (error) {
      console.log(error)
    }
  }

  // Función para cargar las banderas de las tareas almacenadas en el almacenamiento local
  const loadTaskFlags = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys()
      const storedFlags = {}
      // Recorrer todas las claves y obtener los valores correspondientes
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key)
        storedFlags[key] = value === 'true' // Almacenar las banderas como booleanos
      }
      setTaskFlags(storedFlags) // Establecer las banderas en el estado
    } catch (error) {
      console.log(error)
    }
  }

  // Para mantener marcado el indicador de que se ha editado una tarea para saber si se ha editado o no
  const toggleIcon = async (taskId) => {
    if (!iconChanges[taskId]) {
      setIconChanges({ ...iconChanges, [taskId]: true })
      try {
        await AsyncStorage.setItem(`iconChanges_${taskId}`, 'true')
      } catch (error) {
        console.log('Error al guardar el estado del icono:', error)
      }
    }
  }

  const retrieveIconChanges = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys()
      const iconChangesData = {}
      // Filtra las claves que corresponden a los estados de los cambios de icono
      const iconChangesKeys = keys.filter(key => key.startsWith('iconChanges_'))
      // Recorre las claves y carga los estados de los cambios de icono correspondientes
      for (const key of iconChangesKeys) {
        const taskId = key.split('_')[1]
        const value = await AsyncStorage.getItem(key)
        iconChangesData[taskId] = value === 'true'
      }
      setIconChanges(iconChangesData)
    } catch (error) {
      console.log('Error al cargar estado de icono:', error)
    }
  }

  // Función para manejar el cambio de categoría de las tareas
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory)
  }

  const openCalendar = () => {
    setCalendarVisible(true) // Mostrar el calendario
  }

  const handleDateSelected = (date) => {
    setSelectedDate(date)
    setCalendarVisible(false)
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
                  <Text style={{ fontWeight: '900', color: '#242b40' }}>Tareas por hacer | {selectedDate ? moment(selectedDate).locale('es').format('DD/MM/YYYY') : today}</Text>

                  <TouchableOpacity onPress={togglePendingCollapse}>
                    <MaterialIcons name={pendingCollapsed ? 'arrow-drop-up' : 'arrow-drop-down'} size={24} color='#242b40' />
                  </TouchableOpacity>
                </View>
              )}

              {!pendingCollapsed && (
                <SwipeListView
                  data={pendingTodos}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => (
                    <Pressable style={{ backgroundColor: '#e7edfd', padding: 10, borderRadius: 7, marginVertical: 5, color: '#242b40' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, color: '#242b40' }}>
                        <TouchableOpacity onPress={() => markTodoAsCompleted(item?._id)} activeOpacity={0.5}>
                          <Entypo name='circle' size={18} color='#242b40' />
                        </TouchableOpacity>
                        <Text style={{ flex: 1, fontWeight: '500' }}>{item?.title}</Text>
                        <TouchableOpacity
                          onPress={() => {
                            toggleIcon(item._id)
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
                          <MaterialCommunityIcons name={iconChanges[item._id] ? 'file-edit' : 'file-edit-outline'} size={24} color='#242b40' style={{ marginRight: 3, bottom: 1 }} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => toggleFlag(item._id)} activeOpacity={0.3}>
                          <Ionicons
                            name={taskFlags[item._id] ? 'flag' : 'flag-outline'}
                            size={25}
                            color={taskFlags[item._id] ? '#ce6464' : '#242b40'}
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
              )}

              {completedTodos?.length > 0 && (
                <View style={{ marginTop: 20 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginVertical: 5 }}>
                    <Text style={{ fontWeight: '900', marginRight: 'auto', color: '#242b40' }}>Tareas completadas</Text>
                    <TouchableOpacity onPress={toggleCompletedCollapse}>
                      <MaterialIcons name={completedCollapsed ? 'arrow-drop-up' : 'arrow-drop-down'} size={24} color='#242b40' />
                    </TouchableOpacity>
                  </View>

                  {!completedCollapsed && (
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
                  )}
                </View>
              )}

            </View>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 130, marginLeft: 'auto', marginRight: 'auto' }}>
              <Animatable.Image
                ref={imageRef}
                style={{ width: 280, height: 280, left: 10, resizeMode: 'contain' }}
                source={{ uri: 'https://www.pngall.com/wp-content/uploads/8/Task-List.png' }}
              />
              <Text style={{ fontSize: 18, marginTop: 15, fontWeight: '700', textAlign: 'center' }}>No tienes tareas por hacer en esta categoría. ¡Añade una tarea!</Text>
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
        modalTitle={<ModalTitle titleStyle={{ fontWeight: '900', color: '#242b40' }} title='Añadir una tarea' />}
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
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={addTodo}
              disabled={loading}
            >
              {loading ? (
                <Image
                  source={require('./loading2.gif')}
                  size={28}
                  style={{ width: 28, height: 50, left: 5 }}
                />
              ) : (
                <Ionicons name='send' size={28} style={{ left: 5 }} color='#6689ee' />
              )}
            </TouchableOpacity>

            {/* <TouchableOpacity activeOpacity={0.6}>
              <Ionicons name='mic' size={30} color='#6689ee' />
            </TouchableOpacity> */}
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
            <TouchableOpacity onPress={openCalendar} style={{ marginLeft: 10 }}>
              <Entypo name="calendar" size={24} color="#6689ee" />
            </TouchableOpacity>
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

      {/* Modal para mostrar el calendario */}
      <Modal visible={isCalendarVisible} transparent={true} animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }}>
          {/* Fondo semitransparente */}
          <TouchableOpacity
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
            onPress={() => setCalendarVisible(false)} // Oculta el calendario si se toca fuera de él
          >
            <View style={{ flex: 1 }} />
          </TouchableOpacity>

          {/* Calendario */}
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
            <Calendar
              onDayPress={(day) => handleDateSelected(day.dateString)}
              markedDates={{ [selectedDate]: { selected: true, selectedColor: '#7CB9E8' } }}
            />
          </View>
        </View>
      </Modal>

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