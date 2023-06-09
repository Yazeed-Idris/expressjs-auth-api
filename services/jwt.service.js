let jwt = require('jsonwebtoken')

function generateAccessToken(username) {
    return jwt.sign(username, process.env.TOKEN_SECRET, {expiresIn: '60s'});
}


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader?.split(' ')[1] ?? null

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => { // user is coming from the decoded token
        console.log('error:', err)

        if (err) return res.sendStatus(403)

        req.user = user

        next()
    })
}

module.exports = {
    authenticateToken,
    generateAccessToken
}
