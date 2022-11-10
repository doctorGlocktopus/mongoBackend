const User = require('./models/user')

async function authUser(req, res, next) {
    user = await User.findById(req.get("auth"))
    if (user) {
        next()
    } else {
        res.status(403)
        return res.send("Sie muessen sich einloggen")
    }
}

module.exports = {
    authUser
}