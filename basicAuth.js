function authUser(req, res, next) {
    if(!req.get("auth")) {
        res.status(403)
        return res.send("Sie muessen sich einloggen")
    }
    next()
}

module.exports = {
    authUser
}