let express = require('express')
let path = require('path')
let bcrypt = require('bcrypt')
const saltRounds = 10
let dotenv = require('dotenv')
let app = express()
app.use(express.json())
dotenv.config()

let {db, insertUser, getUser} = require('./database.service')
let {router:jwtRouter, authenticateToken, generateAccessToken} = require('./jwt.service')

app.post('/createUser', (req, res, next) => {

    const username = req.body.username?? null;
    const password = req.body.password?? null;
    const email = req.body.email?? null;

    let hashedPassword;

    bcrypt
        .hash(password, saltRounds)
        .then(hash => {
            hashedPassword = hash

            insertUser(db, {
                username: username,
                email: email,
                password: hashedPassword,
            }).then((data) => {
                if (data === 0) {
                    res.send('Success')

                    return;
                }
                res.send(`Error: ${data}`)
            })
        })






})
app.use(jwtRouter)

app.listen(3000, () => {
    console.log('listening on port 3000')
})
