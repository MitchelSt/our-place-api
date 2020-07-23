const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const { errors } = require('celebrate');

const ENV = require('./env');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');


mongoose.set('useCreateIndex', true);

const app = express();


app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));
app.use(cors());
app.use(fileUpload({ safeFileName: true },
    { limits: { fileSize: 5 * 1024 * 1024 } },
));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE');
    next();
});

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
    .connect(`mongodb+srv://OUR_PLACES_API_DB:${ENV.DB_PASSWORD}@cluster0-mb0nt.mongodb.net/mern?retryWrites=true&w=majority`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => (
        app.listen(5000),
        console.log('Connected to database!'))
    )
    .catch(error => console.log('Connection to database failed!', error));
