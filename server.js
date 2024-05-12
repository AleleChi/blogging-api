const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Import routes
const userRoutes = require('./routes/userRoutes'); // Ensure the path is correct
const blogRoutes = require('./routes/blogRoutes'); // Ensure the path is correct

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Define a simple route to test our setup
app.get('/', (req, res) => {
    res.send('Hello World');
});

// Mount user routes at '/users'
app.use('/users', userRoutes);

// Mount blog routes at '/blogs'
app.use('/blogs', blogRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
