const jwt = require('jsonwebtoken');
const ENV = require('../env');


function authenticateToken(req, res, next) {
    const token = req.headers.authorization;

    if (!token) return res.status(401).json({ message: 'Could not find token' });

    jwt.verify(token, process.env.JWT_SECRET, (err, userId) => {
        console.log(err);
        if (err) return res.status(403).json({ message: 'Could not verify token' });
        req.userId = userId;
        userId = userId.userId;
        next();
    });
}

module.exports = authenticateToken;
