require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');


app.use(cors());

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4,
});
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', (error) => console.log('Connection to Database'));

app.use(express.json());

const UsersRouter = require('./routes/user');
app.use('/users', UsersRouter);

const TasksRouter = require('./routes/task');
app.use('/tasks', TasksRouter);

require('./mailService');

app.listen(13000, () => console.log('Server Started'));