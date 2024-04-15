import { Pressable, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { AntDesign, Feather } from "@expo/vector-icons";
import { SimpleLineIcons } from '@expo/vector-icons';

const info = () => {
    const params = useLocalSearchParams();
    const navigation = useNavigation();

    const handleBackPress = () => {
        navigation.goBack();
    };

    return (
        <View style={{ flex: 1, backgroundColor: "white", padding: 10 }}>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <TouchableOpacity onPress={handleBackPress}>
                    <AntDesign name="arrowleft" size={24} color="black" />
                </TouchableOpacity>
                <Entypo name="dots-three-vertical" size={24} color="black" />
            </View>

            <View style={{ marginTop: 5 }}>
                <Text style={{ fontSize: 15, fontWeight: "500" }}>
                    Categoría - {params?.category}
                </Text>
            </View>

            <Text style={{ marginTop: 20, fontSize: 17, fontWeight: "600" }}>
                {params?.title}
            </Text>

            <View style={{ marginTop: 50 }} />

            <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <AntDesign name="plus" size={24} color="#7CB9E8" />
                <Text style={{ color: "#7799f9", fontSize: 16, fontWeight: "500" }}>
                    Añadir una subtarea
                </Text>
            </Pressable>

            <View style={{ marginTop: 15 }}>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
                        <AntDesign name="calendar" size={24} color="black" />
                        <Text>Fecha actual</Text>
                    </View>

                    <Pressable
                        style={{ backgroundColor: "#e7edfd", padding: 7, borderRadius: 6 }}
                    >
                        <Text>{params?.dueDate}</Text>
                    </Pressable>
                </View>
            </View>

            <View style={{ marginTop: 15 }}>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
                        <Ionicons name="time-sharp" size={24} color="gray" />
                        <Text>Recordatorio</Text>
                    </View>

                    <Pressable
                        style={{ backgroundColor: "#e7edfd", padding: 7, borderRadius: 6 }}
                    >
                        <Text>No</Text>
                    </Pressable>
                </View>
            </View>

            <View style={{ marginTop: 15 }}>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
                        <Feather name="repeat" size={24} color="black" />
                        <Text>Repetir tarea</Text>
                    </View>

                    <Pressable
                        style={{ backgroundColor: "#e7edfd", padding: 7, borderRadius: 6 }}
                    >
                        <Text>No</Text>
                    </Pressable>
                </View>
            </View>

            <View style={{ marginTop: 15 }}>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
                        <SimpleLineIcons name="note" size={24} color="black" />
                        <Text>Notas</Text>
                    </View>

                    <Pressable
                        style={{ backgroundColor: "#e7edfd", padding: 7, borderRadius: 6 }}
                    >
                        <Text>No añadido</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

export default info;

const styles = StyleSheet.create({});