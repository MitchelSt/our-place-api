const HttpError = require('../models/http-error');

const User = require('../models/mongoose-schemas/user-schema');


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

    let existingUser;
    try {
        const existingUser = User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError(
            'Could not create user.',
            500
        );
        return next(error);
    }

    if (existingUser) {
        const error = new HttpError(
            'User already exists.',
            409
        );
        return next(error);
    }

    const createdUser = new User({
        name,
        email,
        image: 'https://images.unsplash.com/photo-1586297098710-0382a496c814?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80',
        password,
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

    res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    const identfiedUser = await User.findOne({ email: email });

    try {
        identfiedUser.password === password;
    } catch (err) {
        const error = new HttpError(
            'Credentials seem to be wrong.',
            401
        );
        return next(error);
    }

    res.status(200).json('Login in successful');
};


exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;