const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bycrypt = require('bcrypt');
const {authUser} = require("../basicAuth");
const jose = require("jose");

const string = process.env.ACCESS_TOKEN_PRIVAT.replace(/\[LINEBREAK\]/g, "\n");
const ecPrivateKey = jose.importPKCS8(string, "RS256");
// const publicKey = process.env.ACCESS_TOKEN_PUBLIC.replace(/\[LINEBREAK\]/g, "\n")


// login User
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({username: req.body.username});
        const match = await bycrypt.compare(req.body.password, user.password);
        if (match) {
            const username = req.body.username;

            const newUser = {
                _id: user._id,
                username: username,
                admin: user.admin,
            };

            const token = await new jose.SignJWT(newUser)
                .setProtectedHeader({alg: "RS256"})
                .setIssuedAt()
                .setExpirationTime('2h')
                .sign(await ecPrivateKey);

            return res.status(200).send({
                user: newUser,
                accessToken: token,
            });
        } else {
            return res.status(400).send();
        }
    } catch (err) {
        return res.status(500).json({message: err.message});
    }
});

// Getting all
router.get('/', async (req, res) => {
    try {
        const user = await User.find().select(['username', 'admin']);
        return res.json(user);
    } catch (err) {
        return res.status(500).json({message: err.message});
    }
});

// Getting one
router.get('/:id', getUser, (req, res) => {
    return res.send(res.user);
});

// Create one
router.post('/', async (req, res) => {
    const usernameCheck = await User.findOne({username: req.body.username});
    if (!usernameCheck) {
        const user = new User({
            username: req.body.username,
            password: await bycrypt.hash(req.body.password, 10),
            email: req.body.email,
            admin: req.body.admin,
        });
        try {
            const newUser = await user.save();
            return res.status(201).json(newUser);
        } catch (err) {
            return res.status(400).json({message: err.message});
        }
    } else {
        return res.status(400).json({message: "Benutzername ist schon vergeben"});
    }
});

// Updating one
router.patch(
    '/:id', authUser, getUser, async (req, res) => {
        if (req.body.username != null) {
            res.user.username = req.body.username;
        }
        if (req.body.password != null) {
            res.user.password = req.body.password;
        }
        try {
            const updatedUser = await res.user.save();
            return res.json(updatedUser);
        } catch (err) {
            return res.status(400).json({message: err.message});
        }
    },
);

// Delete one
router.delete(
    '/:id', authUser, getUser, async (req, res) => {
        try {
            await res.user.remove();
        } catch (err) {
            return res.status(500).json({message: err.message});
        }
    },
);

// getUser Funktion
async function getUser(req, res, next) {
    try {
        const user = await User.findById(req.params.id).select(['username', 'admin']);
        if (user == null) {
            return res.status(404).json({message: 'Cannot find user'});
        }
        res.user = user;
        return next();
    } catch (err) {
        return res.status(500).json({message: err.message});
    }
}

module.exports = router;