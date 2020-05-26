const HttpError = require('../models/http-error')
const { v4: uuid } = require("uuid")


let DUMMY_USERS = [{
    id: 'u1',
    name: 'Mitchel',
    email: 'Mitchel@github.com',
    password: 'cookies'
}, {
    id: 'u2',
    name: 'John',
    email: 'John@Doe.com',
    password: 'cookies2'
}]

const getUsers = (req, res, next) => {
    res.status(200).json({ users: DUMMY_USERS })
}

const signup = (req, res, next) => {
    const { name, email, password } = req.body

    const hasUser = DUMMY_USERS.find(user => user.email === email)
    if (hasUser) {
        return res.status(409).json('Could not create user.')
    }

    const createdUser = {
        id: uuid(),
        name,
        email,
        password
    }

    DUMMY_USERS.push(createdUser)

    res.status(200).json({ user: createdUser })
}

const login = (req, res, next) => {
    const { email, password } = req.body

    const identfiedUser = DUMMY_USERS.find(user => user.email === email)
    if (!identfiedUser || identfiedUser.password !== password) {
        return next(new HttpError('Credentials seem to be wrong.', 401))
    }

    res.status(200).json('Login in successful')
}


exports.getUsers = getUsers
exports.signup = signup
exports.login = login