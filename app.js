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

async function createNewUser(username, password, email) {
    // hashing password
    let hashedPassword = await bcrypt.hash(password, saltRounds)
        .then(hash => {
        return hash;

        })

    // attempting to create user
    return await insertUser(db, {username, email, password: hashedPassword})
        .then((value) => {
        return value    // succeeded to create user
    })
        .catch((err) => {
            throw new Error(err.message)    // failed to create user
        })
}

async function verifyUserPassword(username, password) {
    const user= await getUser(db, username)
        .then(user => {
            return user
        })
        .catch((err) => {
            throw new Error(err.message)
        })
    const verified = await bcrypt.compare(password, user.password)
        .then(result => {
            return result;
        })

    if (!verified) throw new Error('password incorrect')

    return generateAccessToken({username});


}

app.post('/createUser', (req, res, next) => {

    const username = req.body.username?? null;
    const password = req.body.password?? null;
    const email = req.body.email?? null;

    createNewUser(username, password, email)
        .then((value) => {
            console.log('value:', value)
            next()
        })
        .catch((err) => {
           next(err)
        })


})

app.post('/verifyUser', async (req, res, next) => {
    const username = req.body.username?? null;
    const password = req.body.password?? null

    switch (req.body.verificationMethod) {
        case 'password': {
            verifyUserPassword(username, password)
                .then((token) => {
                    res.send(token)
                })
                .catch((err) => {
                    next(err)
                })
            break
        }
        case 'jwt': {
            next()
            break
        }
        default: next()
    }
})

app.use(jwtRouter)

app.listen(3000, () => {
    console.log('listening on port 3000')
})
