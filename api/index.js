const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const crypto = require("crypto")
const sgMail = require('@sendgrid/mail')

sgMail.setApiKey("API KEY")

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
    console.log("El servidor esta ejecutandose")
})

const User = require("./models/user")
const Todo = require("./models/todo")

app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            console.log("Este email ya existe")
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
    const secretKey = crypto.randomBytes(32).toString("hex")
    return secretKey
}

const secretKey = generateSecretKey()

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

app.get("/users/:userId/todos/completed/:date", async (req, res) => {
    try {
        const userId = req.params.userId
        const date = req.params.date

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ error: "El usuario no se ha encontrado." })
        }

        const completedTodos = await Todo.find({
            _id: { $in: user.todos },
            status: "completed",
            createdAt: {
                $gte: new Date(`${date}T00:00:00.000Z`),
                $lt: new Date(`${date}T23:59:59.999Z`),
            },
        }).exec()

        res.status(200).json({ completedTodos })
    } catch (error) {
        res.status(500).json({ error: "Algo ha ido mal" })
    }
})


app.get("/users/:userId/todos/count", async (req, res) => {
    try {
      const userId = req.params.userId

      const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ error: "El usuario no se ha encontrado." })
        }
  
      const totalCompletedTodos = await Todo.countDocuments({
        _id: { $in: user.todos },
        status: "completed",
      }).exec()
  
      const totalPendingTodos = await Todo.countDocuments({
        _id: { $in: user.todos },
        status: "pending",
      }).exec()
  
      res.status(200).json({ totalCompletedTodos, totalPendingTodos })
    } catch (error) {
      res.status(500).json({ error: "Error en la conexión." })
    }
  })

app.delete("/todos/:todoId", async (req, res) => {
    try {
        const todoId = req.params.todoId

        const deletedTodo = await Todo.findByIdAndDelete(todoId)
        if (!deletedTodo) {
            return res.status(404).json({ error: "La tarea no se ha encontrado." })
        }

        const user = await User.findOneAndUpdate(
            { todos: todoId },
            { $pull: { todos: todoId } },
            { new: true }
        )

        if (!user) {
            return res.status(404).json({ error: "El usuario no se ha encontrado." })
        }

        res.status(200).json({ message: "Tarea eliminada correctamente." })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Error al eliminar la tarea." })
    }
})

app.delete("/todos/delete-all/:userId", async (req, res) => {
    try {
        const userId = req.params.userId

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ error: "El usuario no se ha encontrado." })
        }

        const deletedTodos = await Todo.deleteMany({ _id: { $in: user.todos } })
        if (!deletedTodos) {
            return res.status(404).json({ error: "No se han encontrado tareas para eliminar." })
        }

        user.todos = []
        await user.save()

        res.status(200).json({ message: "Todas las tareas han sido eliminadas." })
    } catch (error) {
        console.log("Error al eliminar todas las tareas:", error)
        res.status(500).json({ title: "Error al borrar", message: "Error al eliminar todas las tareas." })
    }
})

app.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ title: "Error de datos", message: "El correo electrónico no está registrado." })
        }

        const msg = {
            to: email,
            from: { name: 'no-reply', email: 'saleunomas@gmail.com' },
            subject: "Recuperación de contraseña",
            text: `
                Estimado usuario,
        
                Hemos recibido una solicitud para restablecer la contraseña asociada a tu cuenta. 
                Si no has solicitado este cambio, puedes ignorar este mensaje con tranquilidad.
        
                Para restablecer tu contraseña, haz clic en el siguiente enlace:
                [Enlace para restablecer contraseña]
        
                Si el botón de arriba no funciona, copia y pega la siguiente URL en tu navegador web:
                [URL de restablecimiento de contraseña]
        
                Atentamente,
                El equipo de soporte técnico
            `,
            html: `
                <div style="font-family: Arial, sans-serif max-width: 600px margin: 0 auto">
                    <p style="font-size: 16px line-height: 1.6">
                        Estimado usuario,
                    </p>
                    <p style="font-size: 16px line-height: 1.6">
                        Hemos recibido una solicitud para restablecer la contraseña asociada a tu cuenta. 
                        Si no has solicitado este cambio, puedes ignorar este mensaje con tranquilidad.
                    </p>
                    <p style="font-size: 16px line-height: 1.6">
                        Para restablecer tu contraseña, haz clic en el siguiente enlace:
                        <a href="[Enlace para restablecer contraseña]" style="color: #406ef2">Restablecer contraseña</a>
                    </p>
                    <p style="font-size: 16px line-height: 1.6">
                        Si el botón de arriba no funciona, copia y pega la siguiente URL en tu navegador web:
                        [URL de restablecimiento de contraseña]
                    </p>
                    <p style="font-size: 16px line-height: 1.6">
                        Atentamente,<br>
                        El equipo de soporte técnico
                    </p>
                </div>
            `
        }

        await sgMail.send(msg)
        res.status(200).json({ title: "Recuperación de contraseña", message: "Se ha enviado un correo electrónico de recuperación de contraseña." })
    } catch (error) {
        console.log("Error al enviar el correo electrónico de recuperación de contraseña:", error)
        res.status(500).json({ title: "Error de envío", message: "Hubo un error al enviar el correo electrónico de recuperación de contraseña." })
    }
})

