const HttpError = require('../models/http-error');
const { v4: uuidv4 } = require('uuid');

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
    const image = req.files.image;
    console.log(image);

    let existingUser;
    try {
        existingUser = User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError(
            'Could not create user.',
            500
        );
        return next(error);
    }
    //xxx fix existingUser
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

    const existingUser = await User.findOne({ email: email });

    try {
        existingUser.password === password;
    } catch (err) {
        const error = new HttpError(
            'Credentials seem to be wrong.',
            401
        );
        return next(error);
    }

    res.status(200).json({
        message: 'Login in successful',
        user: existingUser.toObject({ getters: true })
    });
};


exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;