const express = require('express')
const router = express.Router()
const { celebrate } = require('celebrate');

const placesControllers = require('../controllers/places-controllers')
const { placesSchema } = require('../schemas')


router.get('/:placeId', placesControllers.getPlaceById)

router.get('/user/:userId', placesControllers.getPlacesByUserId)

router.post('/', celebrate({ body: placesSchema }), placesControllers.createPlace)

router.patch('/:placeId', celebrate({ body: placesSchema }), placesControllers.updatePlaceById)

router.delete('/:placeId', placesControllers.deletePlaceById)


module.exports = router