import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, ViewBase } from 'react-native'
import React, { useState } from 'react'
import { AntDesign } from '@expo/vector-icons';
import { BottomModal, ModalContent, ModalTitle, SlideAnimation } from 'react-native-modals';
import { Ionicons } from '@expo/vector-icons';

const index = () => {
  const todos = []
  const [isModalVisible, setModalVisible] = useState(false)
  const [todo, setTodo] = useState("")
  const suggestions = [
    {
      id: "0",
      todo: "Hacer ejercicio",
    },
    {
      id: "1",
      todo: "Ir a la tienda para comprar tomates",
    },
    {
      id: "2",
      todo: "Acostarse a las 10:00",
    },
    {
      id: "3",
      todo: "Tomar la pastilla",
    },
    {
      id: "4",
      todo: "Recoger a Felipe del colegio",
    },
    {
      id: "5",
      todo: "Terminar deberes de ayer",
    },
  ]
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
            <View></View>
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
            <Ionicons name="send" size={30} color="#406ef2" />
          </View>

          <Text>Elige la categoría</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 10 }}>
            <Pressable
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
          <View style={{flexDirection:"row", alignItems:"center", gap:10, flexWrap:"wrap", marginVertical:10}}>
            {suggestions?.map((item, index) => (
              <Pressable style={{backgroundColor:"#f0f8ff", paddingHorizontal:10, paddingVertical:4, borderRadius:10}} key={index}>
                <Text style={{textAlign:"center"}}>{item?.todo}</Text>
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