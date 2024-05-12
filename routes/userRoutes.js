const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust the path to your User model

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation rules for registration
const registrationValidationRules = [
  body('email').isEmail().withMessage('Enter a valid email address'),
  body('first_name').not().isEmpty().withMessage('First name is required'),
  body('last_name').not().isEmpty().withMessage('Last name is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

// Register user endpoint
router.post('/register', registrationValidationRules, handleValidationErrors, async (req, res) => {
  try {
    const { email, first_name, last_name, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, first_name, last_name, password: hashedPassword });
    await user.save();
    res.status(201).send({ message: 'User created successfully', user: { email, first_name, last_name } });
  } catch (error) {
    console.error('Error in registration:', error);
    res.status(500).send({ message: 'Internal server error', error: error.message });
  }
});

// Validation rules for login
const loginValidationRules = [
  body('email').isEmail().withMessage('Enter a valid email address'),
  body('password').not().isEmpty()
];

// Login user endpoint
router.post('/login', loginValidationRules, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send({ message: 'Login failed, user not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.send({ message: 'Logged in successfully', token, user: { id: user._id, email: user.email } });
  } catch (error) {
    res.status(500).send({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;
