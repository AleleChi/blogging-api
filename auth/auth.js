const jwt = require('jsonwebtoken');
const { expressjwt: expressJwt } = require('express-jwt');  // Updated import for express-jwt v6.x and later
const User = require('../models/User');  // Ensure the path matches your project structure

const secret = process.env.JWT_SECRET;  // Ensures the secret is sourced from environment variables

// Middleware to protect routes using the updated `expressJwt` import and parameter changes
const requireSignin = expressJwt({
    secret: secret,
    algorithms: ["HS256"],
    requestProperty: 'auth'  // 'userProperty' is replaced with 'requestProperty' in v6.x
});

// Function to generate a JWT token
const generateToken = (user) => {
    return jwt.sign({_id: user._id}, secret, { expiresIn: '1h' });
};

module.exports = { requireSignin, generateToken };
