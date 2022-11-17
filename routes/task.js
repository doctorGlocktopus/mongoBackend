const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const {authUser} = require("../basicAuth");

// Getting all
router.get('/', authUser, async (req, res) => {
    try {
        const tasks = await Task.find({user_id: req.user._id}).populate("user_id", {password: false});
        return res.json(tasks);
    } catch (err) {
        return res.status(500).json({message: err.message});
    }
});

// Getting one
router.get(
    '/:id', authUser, getTask, (req, res) => {
        return res.send(res.task);
    },
);

// Create one
router.post('/', authUser, async (req, res) => {
    let user_id = req.user + "";
    const task = new Task({
        title: req.body.title,
        text: req.body.text,
        done: 0,
        user_id: user_id,
    });
    try {
        const newTask = await task.save();
        return res.status(201).json(newTask);
    } catch (err) {
        return res.status(400).json({message: err.message});
    }
});

// Updating one
router.patch(
    '/:id', authUser, getTask, async (req, res) => {
        if (req.body.title != null) {
            res.task.title = req.body.title;
        }
        if (req.body.text != null) {
            res.task.text = req.body.text;
        }
        if (req.body.done != null) {
            res.task.done = !res.task.done;
        }

        try {
            const updatedTask = await res.task.save();
            return res.json(updatedTask);
        } catch (err) {
            return res.status(400).json({message: err.message});
        }
    },
);

// Delete one
router.delete(
    '/:id', authUser, getTask, async (req, res) => {
        try {
            return await res.task.remove();
        } catch (err) {
            return res.status(500).json({message: err.message});
        }
    },
);


async function getTask(req, res, next) {
    try {
        const _id = req.params.id;
        const task = await Task.findById(_id);
        if (task == null) {
            return res.status(404).json({message: 'Cannot find task'});
        }
        res.task = task;
        return next();
    } catch (err) {
        return res.status(500).json({message: err.message});
    }
}

module.exports = router;