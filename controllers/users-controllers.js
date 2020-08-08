
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const argon2 = require('argon2');

const ENV = require('../env');
const HttpError = require('../models/http-error');
const User = require('../models/mongoose-schemas/user-schema');
const generateAccessToken = require('../util/generateAccessToken');

const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password');
    } catch (err) {
        const error = new HttpError(
            'Could not get users.',
            500
        );
        return next(error);
    }

    res.status(200).json({ users: users.map(user => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
    const { name, email, password } = req.body;
    const image = req.files.image;

    let existingUser;
    let hash;
    try {
        existingUser = User.findOne({ email: email });

        hash = await argon2.hash(password);
    } catch (err) {
        const error = new HttpError(
            'Could not create user.',
            500
        );
        return next(error);
    }

    if (!existingUser) {
        const error = new HttpError(
            'User already exists.',
            409
        );
        return next(error);
    }

    const updatedImage = { ...image, id: uuidv4() };
    updatedImage.mv(`./uploads/images/${updatedImage.id}.jpeg`, function (error) {
        if (error) return error;
    });

    const createdUser = new User({
        name,
        email,
        image: `uploads/images/${updatedImage.id}.jpeg`,
        password: hash,
        places: []
    });

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError(
            'Could not create user.',
            500
        );
        return next(error);
    }

    const userId = createdUser._id;

    const accessToken = generateAccessToken({ userId });

    res.status(200).json({ message: 'Signup success', userId, accessToken });
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email: email }).select('+password');
        const userId = existingUser._id;

        if (!existingUser) return res.status(401).send({ message: 'Credentials seem to be wrong' });

        try {
            await argon2.verify(existingUser.password, password);
        } catch (err) {
            res.status(401).send({ message: 'Credentials seem to be wrong' });
        }

        const accessToken = generateAccessToken({ userId });

        res.status(200).json({ message: 'Login success', userId, accessToken });
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    getUsers,
    signup,
    login,
};