const User = require('./models/user');
const jose = require("jose");

async function authUser(req, res, next) {
    const string = await process.env.ACCESS_TOKEN_PUBLIC.replace(/\[LINEBREAK\]/g, "\n");
    const key = await jose.importSPKI(string, "RS256");

    let jwt = req.get("auth");

    if (jwt) {
        try {
            const {payload} = await jose.jwtVerify(jwt, await key);
            let user = await User.findById(payload._id);
            if (user) {
                req.user = user._id;
                next();
            }
        } catch {
            return res.status(403).send("JWT fehlgeschlagen");
        }
    } else {
        res.status(403);
        return res.send("Sie muessen sich einloggen");
    }
}

module.exports = {authUser};