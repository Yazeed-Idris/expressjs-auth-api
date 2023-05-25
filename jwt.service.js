let express = require('express')
let router = express.Router()
let jwt = require('jsonwebtoken')

function generateAccessToken(username) {
    return jwt.sign(username, process.env.TOKEN_SECRET, {expiresIn: '1800s'});
}



router.post('/createUser', (req, res, next) => {
    const username = req.body.username
    const token = generateAccessToken({username})
    res.json(token)
    next()
})

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader?.split(' ')[1] ?? null

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        console.log('error:', err)

        if (err) return res.sendStatus(403)

        req.user = user

        next()
    })
}

module.exports = {
    router,
    authenticateToken,
    generateAccessToken
}
