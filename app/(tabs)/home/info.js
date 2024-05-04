import React, { useState, useEffect } from "react";
import { Pressable, StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Animated } from "react-native";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { AntDesign, Feather } from "@expo/vector-icons";
import { SimpleLineIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Info = () => {
    const params = useLocalSearchParams();
    const navigation = useNavigation();
    const [reminder, setReminder] = useState("No");
    const [subtask, setSubtask] = useState("");
    const [subtasksList, setSubtasksList] = useState([]);
    const [isAddingSubtask, setIsAddingSubtask] = useState(false);
    const [currentDate, setCurrentDate] = useState("");

    const handleBackPress = () => {
        navigation.goBack();
    }

    useEffect(() => {
        loadReminderState();
        loadSubtasks();
        setCurrentDate(getFormattedDate());
    }, [])

    const getFormattedDate = () => {
        const date = new Date().toLocaleDateString();
        return date;
    }

    const toggleReminder = () => {
        if (reminder === "No") {
            setReminder("Sí");
            saveReminderState("Sí");
            sendNotification();
        } else {
            setReminder("No");
            saveReminderState("No");
        }
    }

    const sendNotification = () => {
        console.log("Los recordatorios para esta tarea han sido activados.");
    }

    const saveReminderState = async (value) => {
        try {
            await AsyncStorage.setItem(`reminderState_${params?.id}`, value);
        } catch (error) {
            console.log("Error al guardar el estado del recordatorio:", error);
        }
    }

    const loadReminderState = async () => {
        try {
            const value = await AsyncStorage.getItem(`reminderState_${params?.id}`);
            if (value !== null) {
                setReminder(value);
            }
        } catch (error) {
            console.log("Error al cargar el estado del recordatorio:", error);
        }
    }

    const handleSubtaskChange = (text) => {
        setSubtask(text);
    }

    const addSubtask = async () => {
        if (subtask.trim() !== "") {
            try {
                const updatedSubtasksList = [...subtasksList, subtask];
                await AsyncStorage.setItem(`subtasksList_${params?.id}`, JSON.stringify(updatedSubtasksList));
                setSubtasksList(updatedSubtasksList);
                setSubtask("");
            } catch (error) {
                console.log("Error al agregar la subtarea:", error);
            }
        }
    }

    const loadSubtasks = async () => {
        try {
            const subtasks = await AsyncStorage.getItem(`subtasksList_${params?.id}`);
            if (subtasks !== null) {
                setSubtasksList(JSON.parse(subtasks));
            }
        } catch (error) {
            console.log("Error al cargar las subtareas:", error);
        }
    }

    const toggleAddSubtaskField = () => {
        setIsAddingSubtask((prev) => !prev);
        if (isAddingSubtask && subtask.trim() !== "") {
            addSubtask();
        }
    }

    const deleteSubtask = async (index) => {
        try {
            const updatedSubtasksList = [...subtasksList];
            updatedSubtasksList.splice(index, 1);
            await AsyncStorage.setItem(`subtasksList_${params?.id}`, JSON.stringify(updatedSubtasksList));
            setSubtasksList(updatedSubtasksList);
        } catch (error) {
            console.log("Error al eliminar la subtarea:", error);
        }
    }

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
                <Text style={{ fontSize: 15, fontWeight: "900" }}>
                    Categoría - {params?.category}
                </Text>
            </View>

            <Text style={{ marginTop: 20, fontSize: 17, fontWeight: "700" }}>
                {params?.title}
            </Text>

            <View style={{ marginTop: 50 }} />

            {!isAddingSubtask && (
                <Pressable onPress={toggleAddSubtaskField} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <AntDesign name="plus" size={24} color="#7CB9E8" />
                    <Text style={{ color: "#7799f9", fontSize: 16, fontWeight: "700" }}>
                        Añadir una subtarea
                    </Text>
                </Pressable>
            )}

            {isAddingSubtask && (
                <View>
                    <TextInput
                        value={subtask}
                        onChangeText={handleSubtaskChange}
                        placeholder="Introduce una subtarea"
                        style={{ padding: 10, borderColor: "#e0e0e0", borderWidth: 1, borderRadius: 5, marginTop: 10, fontWeight:"500"}}
                    />
                    <Pressable onPress={toggleAddSubtaskField} style={{ backgroundColor: "#406ef2", padding: 10, borderRadius: 5, marginTop: 10 }}>
                        <Text style={{ color: "white", textAlign: "center", fontWeight:"700"}}>Agregar subtarea</Text>
                    </Pressable>
                </View>
            )}

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
                        <Text style={{fontWeight:"700"}}>Fecha actual</Text>
                    </View>

                    <Pressable
                        style={{ backgroundColor: "#e7edfd", padding: 7, borderRadius: 6 }}
                    >
                        <Text style={{fontWeight:"400"}}>{currentDate}</Text>
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
                        <Ionicons name="time-outline" size={24} color="black" />
                        <Text style={{fontWeight:"700"}}>Recordatorio</Text>
                    </View>

                    <Pressable
                        onPress={toggleReminder}
                        style={{ backgroundColor: "#e7edfd", padding: 7, borderRadius: 6 }}
                    >
                        <Text style={{fontWeight:"400"}}>{reminder}</Text>
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
                        <Text style={{fontWeight:"700"}}>Notas</Text>
                    </View>

                    <Pressable
                        style={{ backgroundColor: "#e7edfd", padding: 7, borderRadius: 6 }}
                    >
                        <Text style={{fontWeight:"400"}}>{subtasksList.length > 0 ? "Añadido" : "No añadido"}</Text>
                    </Pressable>
                </View>
            </View>

            <ScrollView style={{ marginTop: 15 }}>
                {subtasksList.map((subtask, index) => (
                    <Pressable key={index} onPress={() => deleteSubtask(index)} style={styles.subtaskContainer}>
                        <MaterialCommunityIcons name="pencil-outline" size={20} color="black" />
                        <Text style={{ marginLeft: 5 , fontWeight:"500" }}>{subtask}</Text>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    subtaskContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#e7edfd",
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
})

export default Info