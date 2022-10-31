require('dotenv').config()
// env  DATABASE_URL=mongodb://localhost/task  also mOngoDB datenbank mit compas erstellen
let express = require('express')
const { JsonWebTokenError } = require('jsonwebtoken')
let app = express()
const mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', (error) => console.log('Connection to Database'))

app.use(express.json())

const UsersRouter = require('./routes/user')
app.use('/users', UsersRouter)

const TasksRouter = require('./routes/task')
app.use('/tasks', TasksRouter)

app.listen(13000, () => console.log('Server Started'))