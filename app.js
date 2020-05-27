const express = require('express');
const app = express();
const { errors } = require('celebrate');
const mongoose = require('mongoose');

const ENV = require('./env');


const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');


app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(errors());

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
    const error = new Error('Could not find this route', 404);
    throw error;
});

app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || 'An unknown error has occurred.' });
});


mongoose
    .connect(`mongodb+srv://OUR_PLACES_API_DB:${ENV.DB_PASSWORD}@cluster0-mb0nt.mongodb.net/our_places?retryWrites=true&w=majority`)
    .then(() => (
        app.listen(5000),
        console.log('Connected to database!'))
    )
    .catch(error => console.log('Connection to database failed!', error, DB_PASSWORD));
