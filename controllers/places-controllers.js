const fs = require('fs');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const getCoordinates = require('../util/location');
const HttpError = require('../models/http-error');
const Place = require('../models/mongoose-schemas/place-schema');
const User = require('../models/mongoose-schemas/user-schema');


const getPlaceById = async (req, res, next) => {
    try {
        const placeId = req.params.placeId;

        const place = await Place.findById(placeId);

        res.json({ place: place.toObject({ getters: true }) });
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: 'Could not get place.' });
    }
};

const getPlacesByUserId = async (req, res, next) => {
    try {
        const userId = req.params.userId;

        const places = await Place.find({ creator: userId });

        if (!places || places.length === 0) return res.status(404).json({ message: 'No places have been found.' });

        res.json({
            places: places.map(place => place.toObject({ getters: true }))
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: 'Could not get places.' });
    }
};


const createPlace = async (req, res, next) => {
    const { title, description, address, creator } = req.body;
    const image = req.files.image;

    let coordinates;
    try {
        coordinates = await getCoordinates(address);
    } catch (error) {
        return next(error);
    }

    const updatedImage = { ...image, id: uuidv4() };
    updatedImage.mv(`./uploads/images/${updatedImage.id}.jpeg`, function (error) {
        if (error) return error;
    });

    const createdPlace = new Place({
        title,
        description,
        imageUrl: `uploads/images/${updatedImage.id}.jpeg`,
        address,
        location: coordinates,
        creator
    });

    let user;
    try {
        user = await User.findById(creator);
    } catch (err) {
        const error = new HttpError(
            'Could not create place.',
            500
        );
        return next(error);
    }

    if (!user) {
        const error = new HttpError(
            'Could not find user for provided id.',
            500
        );
        next(error);
    }

    try {
        await createdPlace.save();
        await user.places.push(createdPlace);
        await user.save();
    } catch (err) {
        const error = new HttpError(
            'Could not create place.',
            500
        );
        return next(error);
    }

    res.status(201).json({ place: createdPlace });
};

const updatePlaceById = async (req, res, next) => {
    try {
        const { title, description } = req.body;
        const placeId = req.params.placeId;
        const userId = req.userId;

        const place = await Place.findById(placeId);

        if (place.creator.toString() !== userId) return res.status(401).json({ message: 'Not authorized to update place.' });

        place.title = title;
        place.description = description;

        await place.save();

        res.status(200).json({ place: place.toObject({ getters: true }) });
    } catch (error) {
        res.status(500).json({ message: 'Could not update place.' });
    }
};

const deletePlaceById = async (req, res, next) => {
    try {
        const placeId = req.params.placeId;
        const userId = req.userId.userId;

        place = await Place.findById(placeId);

        if (place.creator.toString() !== userId) return res.status(401).json({ message: 'Not authorized to delete place.' });

        await User.updateOne(
            { _id: userId },
            { $pull: { places: place._id } }
        );
        await place.delete();

        fs.unlink(`./${place.imageUrl}`, error => console.log(error));

        res.status(200).json({ message: 'Place has been deleted.' });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: 'Could not delete place.' });
    }
};


exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;