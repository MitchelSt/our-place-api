const HttpError = require('../models/http-error')
const { v4: uuid } = require("uuid")


let DUMMY_PLACES = [{
    id: "888",
    title: "Hokkaido",
    description: "Early morning while visiting Niseko, Hokkaido, Japan.",
    imageUrl:
        "https://images.unsplash.com/photo-1576829021152-3121bfb1efcb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80",
    address: '448 Niseko, Abuta District, Hokkaido 048-1511, Japan',
    location: {
        lat: 42.844671,
        lng: 141.1117178
    },
    creator: '1'
}, {
    id: "899",
    title: "Hokkaido",
    description: "Early morning while visiting Niseko, Hokkaido, Japan.",
    imageUrl:
        "https://images.unsplash.com/photo-1576829021152-3121bfb1efcb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80",
    address: '448 Niseko, Abuta District, Hokkaido 048-1511, Japan',
    location: {
        lat: 42.844671,
        lng: 141.1117178
    },
    creator: '1'
}]

const getPlaceById = (req, res, next) => {
    const placeId = req.params.placeId
    const place = DUMMY_PLACES.find(place => {
        return place.id === placeId
    })

    if (!place) {
        return next(new HttpError('Could not find the provided place id.', 404))
    }

    res.json({ place })
}

const getPlacesByUserId = (req, res, next) => {
    const userId = req.params.userId
    const places = DUMMY_PLACES.filter(user => user.creator === userId)

    if (!places || places.length === 0) {
        return next(new HttpError('Could not find the provided places id.', 404))
    }

    res.json({ places })
}

const createPlace = (req, res, next) => {
    const { title, description, coordinates, address, creator } = req.body
    const createdPlace = {
        id: uuid(),
        title,
        description,
        location: coordinates,
        address,
        creator
    }

    DUMMY_PLACES.push(createdPlace)

    res.status(201).json({ place: createdPlace })
}

const updatePlaceById = (req, res, next) => {
    const { title, description } = req.body
    const placeId = req.params.placeId

    const updatedPlace = {
        ...DUMMY_PLACES.find(place => place.id === placeId)
    }
    const placeIndex = DUMMY_PLACES.findIndex(place => place.id === placeId)
    updatedPlace.title = title
    updatedPlace.description = description

    DUMMY_PLACES[placeIndex] = updatedPlace

    res.status(200).json({ place: updatedPlace })
}

const deletePlaceById = (req, res, next) => {
    const placeId = req.params.placeId
    DUMMY_PLACES = DUMMY_PLACES.filter(place => place.id !== placeId)

    res.status(200).json({ message: 'Place has been deleted.' })
}


exports.getPlaceById = getPlaceById
exports.getPlacesByUserId = getPlacesByUserId
exports.createPlace = createPlace
exports.updatePlaceById = updatePlaceById
exports.deletePlaceById = deletePlaceById