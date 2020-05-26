const express = require('express')
const app = express()
const { errors } = require('celebrate');


const placesRoutes = require('./routes/places-routes')
const usersRoutes = require('./routes/users-routes')


app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use(errors())

app.use('/api/places', placesRoutes)
app.use('/api/users', usersRoutes)

app.use((req, res, next) => {
    const error = new Error('Could not find this route', 404)
    throw error
})

app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error)
    }
    res.status(error.code || 500)
    res.json({ message: error.message || 'An unknown error has occurred.' })
})


app.listen(5000)