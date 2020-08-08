const axios = require('axios');
const ENV = require('../env');
const HttpError = require('../models/http-error');


async function getCoordinates(address) {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`);

    const data = response.data;

    if (!data || data === 'ZERO_RESULTS') {
        const error = new HttpError('Could not find location for the specified address.', 422);
        throw error;
    }

    const coordinates = data.results[0].geometry.location;

    return coordinates;
}


module.exports = getCoordinates;