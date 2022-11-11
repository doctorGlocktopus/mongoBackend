const express = require('express')
const router = express.Router()
const Task = require('../models/task')
const bycrypt = require('bcrypt');
const { authUser } = require("../basicAuth")

// Getting all
router.get('/', authUser, async (req, res) => {
    const auth = req.get("auth")
    try {
        const tasks = await Task.find({ user_id: auth }).populate("user_id", { password: false })
        res.json(tasks)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Getting one
router.get('/:id', authUser, getTask, (req, res) => {
    res.send(res.task)
})

// Create one
router.post('/', async (req, res) => {
    const task = new Task({
        title: req.body.title,
        text: req.body.text,
        done: 0,
        user_id: req.body.user_id,
    })
    try {
        const newTask = await task.save()
        res.status(201).json(newTask)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// Updating one
router.patch('/:id', authUser, getTask, async (req, res) => {

    if (req.body.title != null) {
        res.task.title = req.body.title
    }
    if (req.body.text != null) {
        res.task.text = req.body.text
    }
    if (req.body.done != null) {
        res.task.done = !res.task.done
    }

    try {
        const updatedTask = await res.task.save()
        res.json(updatedTask)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// Delete one
router.delete('/:id', getTask, async (req, res) => {
    try {
        await res.task.remove()
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})



async function getTask(req, res, next) {
    try {
        task = await Task.findById(req.params.id)
        if (task == null) {
            return res.status(404).json({ message: 'Cannot find task' })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
    res.task = task
    next()
}

module.exports = router