const jwt = require('jsonwebtoken');
const { expressjwt: expressJwt } = require('express-jwt');  
const User = require('../models/User');  

const secret = process.env.JWT_SECRET;  

// Middleware to protect routes using the updated `expressJwt` import and parameter changes
const requireSignin = expressJwt({
    secret: secret,
    algorithms: ["HS256"],
    requestProperty: 'auth'  
});

// Function to generate a JWT token
const generateToken = (user) => {
    return jwt.sign({_id: user._id}, secret, { expiresIn: '1h' });
};

module.exports = { requireSignin, generateToken };
