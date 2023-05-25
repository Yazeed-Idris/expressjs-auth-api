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


async function insertUser(db, {username, email, password}) {
    const userObj = {
        username: username,
        email: email,
        password: password,
    }
    const result = await db.none('insert into credentials(username, email, password) values(${username}, ${email}, ${password})', userObj)
        .then((data) => {
            return 0;
        })
        .catch((err) => {
            if (err['code'] === '23505') {
                console.log('user already exists please use other credentials')
                return err['code'];
            }
            console.log('error:', err['detail'])
            return -1
        })
    return result;
}


async function getUser(db, username) {
    const user = await db.one('select * from credentials where username = $1', username).then((user) => {
        return user;
    })
    return user;
}

module.exports = {db, insertUser, getUser};
