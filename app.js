let express = require('express')
let path = require('path')
let jwt = require('jsonwebtoken')
let dotenv = require('dotenv')


let app = express()
app.use(express.json())

dotenv.config()
const accessToken = process.env.TOKEN_SECRET


const dbInitOptions = {}
let pgp = require('pg-promise')(dbInitOptions)
const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
}
let db = pgp(dbConfig)

async function getUser(db, username) {
    const user = await db.one('select * from credentials where username = $1', username).then((user) => {
        return user;
    })
    return user;
}

async function insertUser(db, {username, email, password}) {
    //todo: hash password

    const userObj = {
        username: username,
        email: email,
        password: password,
    }
    await db.none('insert into credentials(username, email, password) values(${username}, ${email}, ${password})', userObj)
        .then((data) => {
        console.log('data:', data)
    })
        .catch((err) => {
            if (err['code'] === '23505') {
                console.log('user already exists please use other credentials')
                return err['code'];
            }

            console.log('error:', err['detail'])
        })
}

insertUser(db, {
    username: 'The Peng',
    email: 'pen@gmail.ssssa',
    password: '12348492484928492842982948429849428424298429'
})
function generateAccessToken(username) {
    return jwt.sign(username, process.env.TOKEN_SECRET, {expiresIn: '1800s'});
}

app.post('/createUser', (req, res, next) => {

    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    next()
})

app.post('/createUser', (req, res, next) => {
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

// app.get('/orders', authenticateToken, (req, res, next) => {
//     console.log('request:', req)
//     console.log('user in req', req.user)
//     console.log('user in body', req.body.user)
//     next()
// })

app.listen(3000, () => {
    console.log('listening on port 3000')
})
