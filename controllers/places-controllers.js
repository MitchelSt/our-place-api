const HttpError = require('../models/http-error');
const mongoose = require('mongoose');
const getCoordinates = require('../util/location');

const Place = require('../models/mongoose-schemas/place-schema');
const User = require('../models/mongoose-schemas/user-schema');


const getPlaceById = async (req, res, next) => {
    const placeId = req.params.placeId;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError(
            'Could not get place.',
            500
        );
        return next(error);
    }

    res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.userId;

    let places;
    try {
        places = await Place.find({ creator: userId });
    } catch (err) {
        const error = new HttpError(
            'Could not get places',
            500
        );
        return next(error);
    }

    if (!places || places.length === 0) {
        const error = new HttpError(
            'Could not find places for provided user.',
            500
        );
        next(error);
    }

    res.json({
        places: places.map(place => place.toObject({ getters: true }))
    });
};

const createPlace = async (req, res, next) => {
    const { title, description, address, creator } = req.body;

    let coordinates;
    try {
        coordinates = await getCoordinates(address);
    } catch (error) {
        return next(error);
    }

    const createdPlace = new Place({
        title,
        description,
        imageUrl: 'https://images.unsplash.com/photo-1590494349797-9af9ccd2245a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80',
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
            'Could not find user for provide id.',
            500
        );
        next(error);
    }

    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        await createdPlace.save({ session: session });
        user.places.push(createdPlace);
        await user.save({ session: session });
        await session.commitTransaction();
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
    const { title, description } = req.body;
    const placeId = req.params.placeId;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError(
            'Could not update place.',
            500
        );
        return next(error);
    }

    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch (err) {
        const error = new HttpError(
            'Could not save updated place.',
            500
        );
        return next(error);
    }

    res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlaceById = async (req, res, next) => {
    const placeId = req.params.placeId;

    let place;
    try {
        place = await Place.findById(placeId).populate('creator');
    } catch (err) {
        const error = new HttpError(
            'Could not get place.',
            500
        );
        return next(error);
    }

    if (!place) {
        const error = new HttpError(
            'Could not find place.',
            404);
        next(error);
    }

    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        await place.remove({ session: session });
        place.creator.places.pull(place);
        await place.creator.save({ session: session });
        await session.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'Could not delete place.',
            500
        );
        return next(error);
    }

    res.status(200).json({ message: 'Place has been deleted.' });
};


exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;