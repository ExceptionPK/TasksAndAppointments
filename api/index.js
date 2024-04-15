const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const crypto = require("crypto")

const app = express()
const port = 3000
const cors = require("cors")
app.use(cors())

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const jwt = require("jsonwebtoken")
const moment = require("moment")

mongoose.connect("mongodb+srv://pv:pv@cluster0.dtbyiyx.mongodb.net/").then(() => {
    console.log("Conectado a MongoDB")
}).catch((error) => {
    console.log("Error al conectar: ", error)
})

app.listen(port, () => {
    console.log("El servidor esta corriendo")
})

const User = require("./models/user")
const Todo = require("./models/todo")

app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body

        ///Comprobar si el email esta registrado
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            console.log("Email ya existe")
        }

        const newUser = new User({
            name,
            email,
            password
        })

        await newUser.save()
        res.status(202).json({ message: "Usuario registrado" })
    } catch (error) {
        console.log("Error al registrar al usuario", error)
        res.status(500).json({ message: "Registro fallido" })
    }
})

const generateSecretKey = () => {
    const secretKey = crypto.randomBytes(32).toString("hex");

    return secretKey;
};

const secretKey = generateSecretKey();

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({ message: "El correo es incorrecto." })
        }

        if (user.password !== password) {
            return res.status(401).json({ message: "La contraseña es incorrecta." })
        }
        const token = jwt.sign({ userId: user._id, }, secretKey)

        res.status(200).json({ token })
    } catch (error) {
        console.log("Error al iniciar sesión", error)
        res.status(500).json({ message: "Inicio de sesión fallido." })
    }
})

app.post("/todos/:userId", async (req, res) => {
    try {
        const userId = req.params.userId
        const { title, category } = req.body

        const newTodo = new Todo({
            title,
            category,
            dueDate: moment().format("YYYY-MM-DD")
        })

        await newTodo.save()

        const user = await User.findById(userId)
        if (!user) {
            res.status(404).json({ error: "El usuario no se ha encontrado." })
        }

        user?.todos.push(newTodo._id)
        await user.save()

        res.status(200).json({ message: "La tarea se ha añadido.", todo: newTodo })
    } catch (error) {
        res.status(200).json({ message: "No se ha añadido una tarea." })
    }
})

app.get("/users/:userId/todos", async (req, res) => {
    try {
        const userId = req.params.userId

        const user = await User.findById(userId).populate("todos")
        if (!user) {
            return res.status(404).json({ error: "El usuario no se ha encontrado." })
        }

        res.status(200).json({ todos: user.todos })
    } catch (error) {
        res.status(500).json({ message: "Algo ha ido mal" })
    }
})

app.patch("/todos/:todoId/complete", async (req, res) => {
    try {
        const todoId = req.params.todoId

        const updatedTodo = await Todo.findByIdAndUpdate(todoId, {
            status: "completed"
        }, { new: true }
        )

        if (!updatedTodo) {
            return res.status(404).json({ error: "No se ha encontrado la tarea" })
        }

        res.status(200).json({ message: "Tarea marcada como completada", todo: updatedTodo })
    } catch (error) {
        res.status(500).json({ message: "Algo ha ido mal" })
    }
})

app.get("/todos/completed/:date", async (req, res) => {
    try {
        const date = req.params.date;

        const completedTodos = await Todo.find({
            status: "completed",
            createdAt: {
                $gte: new Date(`${date}T00:00:00.000Z`),
                $lt: new Date(`${date}T23:59:59.999Z`),
            },
        }).exec();

        res.status(200).json({ completedTodos })
    } catch (error) {
        res.status(500).json({ error: "Algo ha ido mal" })
    }
})


app.get("/todos/count", async (req, res) => {
    try {
        const totalCompletedTodos = await Todo.countDocuments({
            status: "completed",
        }).exec()

        const totalPendingTodos = await Todo.countDocuments({
            status: "pending",
        }).exec()

        res.status(200).json({ totalCompletedTodos, totalPendingTodos })
    } catch (error) {
        res.status(500).json({ error: "Error en la conexión." })
    }
})