const express = require('express')
const router = express.Router()
const { celebrate } = require('celebrate');

const usersControllers = require('../controllers/users-controllers')
const { usersSchema } = require('../schemas')


router.get('/', usersControllers.getUsers)

router.post('/signup', celebrate({ body: usersSchema }), usersControllers.signup)

router.post('/login', usersControllers.login)


module.exports = router