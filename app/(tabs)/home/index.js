import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, ViewBase } from 'react-native'
import React from 'react'
import { AntDesign } from '@expo/vector-icons';

const index = () => {
  const todos = []
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
          <Text style={{ color: "white", textAlign: "center"}}>Personal</Text>
        </Pressable>

        <Pressable>
          <AntDesign name="pluscircle" size={30} color="#406ef2" />
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
        <View style={{ padding: 10 }}>
          {todos?.length > 0 ? (
            <View></View>
          ) : (
            <View style={{flex:1, justifyContent:"center", alignItems:"center", marginTop:130, marginLeft:"auto", marginRight:"auto"}}>
              <Image
                style={{ width: 280, height: 280, left:10, resizeMode: "contain"}}
                source={{ uri: "https://www.pngall.com/wp-content/uploads/8/Task-List.png" }}
              />
              <Text style={{ fontSize: 18, marginTop: 15, fontWeight: "700", textAlign: "center" }}>No hay tareas disponibles. ¡Añade una tarea!</Text>
            </View>
          )}
        </View>
      </ScrollView>

    </>
  )
}

export default index

const styles = StyleSheet.create({})