import React, { useState, useEffect } from 'react'
import { Pressable, StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Animated, Platform, ToastAndroid, Touchable } from 'react-native'
import { Ionicons, Entypo } from '@expo/vector-icons'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { AntDesign, Feather } from '@expo/vector-icons'
import { SimpleLineIcons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { MaterialCommunityIcons } from '@expo/vector-icons'


const Info = () => {
    const params = useLocalSearchParams()
    const navigation = useNavigation()
    const [reminder, setReminder] = useState('No')
    const [subtask, setSubtask] = useState('')
    const [subtasksList, setSubtasksList] = useState([])
    const [isAddingSubtask, setIsAddingSubtask] = useState(false)
    const [currentDate, setCurrentDate] = useState('')
    const [showOptions, setShowOptions] = useState(false)
    const [fadeAnim] = useState(new Animated.Value(0))

    const toggleOptions = () => {
        setShowOptions(!showOptions)
        Animated.timing(
            fadeAnim,
            {
                toValue: showOptions ? 0 : 1,
                duration: 200,
                useNativeDriver: true,
            }
        ).start()
    }

    const handleBackPress = () => {
        navigation.goBack()
    }

    useEffect(() => {
        loadReminderState()
        loadSubtasks()
        setCurrentDate(getFormattedDate())
    }, [])

    const getFormattedDate = () => {
        const date = new Date().toLocaleDateString()
        return date
    }

    const toggleReminder = () => {
        if (reminder === 'No') {
            setReminder('Sí')
            saveReminderState('Sí')
            sendNotification()
        } else {
            setReminder('No')
            saveReminderState('No')
        }
    }

    const sendNotification = () => {
        if (Platform.OS === 'android') {
            ToastAndroid.show('Los recordatorios para esta tarea han sido activados.', ToastAndroid.SHORT)
        }
    }

    const saveReminderState = async (value) => {
        try {
            await AsyncStorage.setItem(`reminderState_${params?.id}`, value)
        } catch (error) {
            console.log('Error al guardar el estado del recordatorio:', error)
        }
    }

    const loadReminderState = async () => {
        try {
            const value = await AsyncStorage.getItem(`reminderState_${params?.id}`)
            if (value !== null) {
                setReminder(value)
            }
        } catch (error) {
            console.log('Error al cargar el estado del recordatorio:', error)
        }
    }

    const handleSubtaskChange = (text) => {
        setSubtask(text)
    }

    const addSubtask = async () => {
        if (subtask.trim() !== '') {
            try {
                const updatedSubtasksList = [...subtasksList, subtask]
                await AsyncStorage.setItem(`subtasksList_${params?.id}`, JSON.stringify(updatedSubtasksList))
                setSubtasksList(updatedSubtasksList)
                setSubtask('')
            } catch (error) {
                console.log('Error al agregar la subtarea:', error)
            }
        }
    }

    const loadSubtasks = async () => {
        try {
            const subtasks = await AsyncStorage.getItem(`subtasksList_${params?.id}`)
            if (subtasks !== null) {
                setSubtasksList(JSON.parse(subtasks))
            }
        } catch (error) {
            console.log('Error al cargar las subtareas:', error)
        }
    }

    const toggleAddSubtaskField = () => {
        setIsAddingSubtask((prev) => !prev)
        if (isAddingSubtask && subtask.trim() !== '') {
            addSubtask()
        }
    }

    const deleteSubtask = async (index) => {
        try {
            const updatedSubtasksList = [...subtasksList]
            updatedSubtasksList.splice(index, 1)
            await AsyncStorage.setItem(`subtasksList_${params?.id}`, JSON.stringify(updatedSubtasksList))
            setSubtasksList(updatedSubtasksList)
        } catch (error) {
            console.log('Error al eliminar la subtarea:', error)
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'white', padding: 10 }}>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <TouchableOpacity onPress={handleBackPress}>
                    <AntDesign name='arrowleft' size={25} color='black' />
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.5} onPress={toggleOptions}>
                    <Entypo name='dots-three-vertical' style={{ bottom: 1 }} size={22} color='black' />
                </TouchableOpacity>

                <Animated.View style={{ opacity: fadeAnim, position: 'absolute', top: 25, right: 7 }}>
                    {showOptions && (
                        <View style={{ backgroundColor: 'white', padding: 15, borderRadius: 5, elevation: 5 }}>
                            <Pressable onPress={() => console.log('Editar tarea')}>
                                <Text style={{ fontWeight: 400 }}>Editar tarea</Text>
                            </Pressable>
                        </View>
                    )}
                </Animated.View>
            </View>

            <View style={{ marginTop: 30 }}>
                <Text style={{ fontSize: 15, fontWeight: '900' }}>
                    Categoría | {params?.category}
                </Text>
            </View>

            <Text style={{ marginTop: 15, fontSize: 17, fontWeight: '700' }}>
                {params?.title}
            </Text>

            <View style={{ marginTop: 30 }} />

            {!isAddingSubtask && (
                <View style={styles.addButtonContainer}>
                    <TouchableOpacity onPress={toggleAddSubtaskField} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>

                        <Text style={{ color: '#7799f9', fontSize: 16, fontWeight: '700' }}>
                            Añadir una subtarea
                        </Text>
                        <Feather name='plus' size={24} color='#7799f9' />
                    </TouchableOpacity>
                </View>
            )}

            {isAddingSubtask && (
                <View>
                    <TextInput
                        value={subtask}
                        onChangeText={handleSubtaskChange}
                        placeholder='Introduce una subtarea'
                        style={{ padding: 10, borderColor: '#e0e0e0', borderWidth: 1, borderRadius: 5, marginTop: 10, fontWeight: '500' }}
                    />
                    <TouchableOpacity activeOpacity={0.6} onPress={toggleAddSubtaskField} style={{ backgroundColor: '#406ef2', padding: 10, borderRadius: 5, marginTop: 10 }}>
                        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>Agregar subtarea</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.optionContainer}>
                <View style={styles.optionWrapper}>
                    <Ionicons name='time-outline' size={24} color='black' />
                    <Text style={styles.optionText}>Fecha actual</Text>
                </View>
                <Pressable style={styles.optionButton}>
                    <Text style={styles.optionButtonText}>{currentDate}</Text>
                </Pressable>
            </View>

            <View style={styles.optionContainer}>
                <View style={styles.optionWrapper}>
                    <AntDesign name='calendar' size={24} color='black' />
                    <Text style={styles.optionText}>Recordatorio</Text>
                </View>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={toggleReminder}
                    style={styles.optionButton}
                >

                    {reminder === 'No' ? (
                        <MaterialCommunityIcons name='cancel' size={24} color='red' />
                    ) : (
                        <MaterialCommunityIcons name='check' size={24} color='green' />
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.optionContainer}>
                <View style={styles.optionWrapper}>
                    <SimpleLineIcons name='note' size={24} color='black' />
                    <Text style={styles.optionText}>Notas</Text>
                </View>
                <Pressable style={styles.optionButton}>
                    <Text style={styles.optionButtonText}>{subtasksList.length > 0 ? 'Añadido' : 'No añadido'}</Text>
                </Pressable>
            </View>

            <ScrollView style={{ marginTop: 15 }}>
                {subtasksList.map((subtask, index) => (
                    <TouchableOpacity activeOpacity={0.5} key={index} onPress={() => deleteSubtask(index)} style={styles.subtaskContainer}>
                        <MaterialCommunityIcons name='pencil-outline' size={20} color='black' />
                        <Text style={{ marginLeft: 5, fontWeight: '500' }}>{subtask}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    subtaskContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e7edfd',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    optionWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
    },
    optionText: {
        fontWeight: '700',
    },
    optionButton: {
        padding: 7,
        borderRadius: 6,
        width: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionButtonText: {
        fontWeight: '400',
        textAlign: 'center',
    },
    addButtonContainer: {
        backgroundColor: '#e7edfd',
        padding: 5,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginTop: 0,
    },
})

export default Info
