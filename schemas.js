const { Joi } = require('celebrate');


const usersSchema = Joi.object().keys({
    name: Joi.string().min(4).max(26).required().error(new Error('Name is a required field and should be valid!')),
    password: Joi.string().min(4).max(26).required().error(new Error('Password is a required field and should be valid!')),
    email: Joi.string().email().required().error(new Error('Email is a required field and should be valid!'))
});

const placesSchema = Joi.object().keys({
    title: Joi.string().min(4).max(100).required().error(new Error('Title is a required field and should be valid!')),
    description: Joi.string().min(4).max(100).required().error(new Error('Description is a required field and should be valid!')),
    address: Joi.string().min(4).max(100).required().error(new Error('Address is a required field and should be valid!')),
    // location: Joi.required().error(new Error('Location is a required field and should be valid!')),
    // lat: Joi.number().integer().min(-90).max(90).required().error(new Error('Latitude is a required field and should be valid!')),
    // lng: Joi.number().integer().min(-180).max(180).required().error(new Error('Longitude is a required field and should be valid!')),
});


exports.usersSchema = usersSchema
exports.placesSchema = placesSchema