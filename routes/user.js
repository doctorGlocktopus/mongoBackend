const express = require('express')
const router = express.Router()
const User = require('../models/user')
var jwt = require('jsonwebtoken');
const bycrypt = require('bcrypt');


// login User
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({username: req.body.username})
        const match = await bycrypt.compare(req.body.password, user.password);
        if(match) {
            const username = req.body.username
            const user = { username: username}
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
            res.status(200).send({ user: user, accessToken: token})
        }
    } catch(err) {
        res.status(500).json({ message: err.message})
    }
    
    

})

// Getting all
router.get('/', async (req, res) => {
    try {
        const user = await User.find()
        res.json(user)
    } catch (err) {
        res.status(500).json({ message: err.message})
    }
})

// Getting one
router.get('/:id', getUser, (req, res) => {
    res.send(res.user)
})

// Create one
router.post('/', async (req, res) => {
    const usernameCheck = await User.findOne({username: req.body.username})
    if(!usernameCheck) {
        const user = new User ({
            username: req.body.username,
            password: await bycrypt.hash(req.body.password, 10)
        })
        try {
            const newUser = await user.save()
            res.status(201).json(newUser)
        } catch (err) {
            res.status(400).json( {message: err.message})
        }
    } else {
        res.status(400).json( {message: "Benutzername ist schon vergeben"})
    }
})

// Updating one
router.patch('/:id', getUser, async (req, res) => {
    if(req.body.username != null) {
        res.user.username = req.body.username
    }
    if(req.body.password != null) {
        res.user.password = req.body.password
    }
    try {
        const updatedUser = await res.user.save()
        res.json(updatedUser)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// Delete one
router.delete('/:id', getUser, async(req, res) => {
    try {
        await res.user.remove()
    } catch (err) {
        res.status(500).json({ message :err.message })
    }
})

// getUser Funktion
async function getUser(req, res, next) {
    try {
        user = await User.findById(req.params.id)
        if (user == null) {
            return res.status(404).json({ message: 'Cannot find user'})
        }
    } catch (err) {
        return res.status(500).json({ message: err.message})
    }
    res.user = user
    next()
}

module.exports = router