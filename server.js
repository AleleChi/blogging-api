const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const logger = require('./utils/logger'); // Ensure this points to your Winston logger configuration
const helmet = require('helmet');
const cors = require('cors');

dotenv.config();

const app = express();

// Security enhancements
app.use(helmet()); // Sets various HTTP headers to secure your app
app.use(cors()); // Enable CORS with various options

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to log all requests
app.use((req, res, next) => {
    logger.info(`Received ${req.method} request from ${req.ip} for ${req.url}`);
    next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => logger.info('MongoDB Connected'))
.catch(err => {
    logger.error('MongoDB connection error: ' + err.message);
});

// Define a simple route to test our setup
app.get('/', (req, res) => {
    res.send('Hello World');
});

// Import routes
const userRoutes = require('./routes/userRoutes');
const blogRoutes = require('./routes/blogRoutes');

// Mount user routes at '/users'
app.use('/users', userRoutes);

// Mount blog routes at '/blogs'
app.use('/blogs', blogRoutes);

// Error handling middleware for unhandled routes
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

// General error handling middleware
app.use((err, req, res, next) => {
    logger.error(`Error - ${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    res.status(err.status || 500);
    res.send({
        error: {
            status: err.status || 500,
            message: err.message || 'Internal Server Error'
        }
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => logger.info(`Server running on PORT ${PORT}`));
