const jwt = require("jsonwebtoken");
const ENV = require('../env');

function generateAccessToken(userId) {
    return jwt.sign(userId, ENV.JWT_SECRET, { expiresIn: '7d' });
}

module.exports = generateAccessToken;