const express = require('express')
const app = express()

const placesRoutes = require('./routes/places-routes')


app.use(express.urlencoded({ extended: false }))
app.use(express.json())


app.use('/api/places', placesRoutes)

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