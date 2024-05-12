const express = require('express');
const router = express.Router();
const { requireSignin } = require('../auth/auth');  // Ensure this path is correct
const Blog = require('../models/Blog'); // Adjust path as necessary
const Comment = require('../models/Comment'); // Adjust path as necessary

// Get all published blogs with advanced pagination, filtering, and sorting
router.get('/', async (req, res) => {
    const { page = 1, limit = 20, author, title, tags, sortBy = 'timestamp', order = 'desc' } = req.query;
    let query = {
        state: 'published',
        ...(author && { author }),
        ...(title && { title: { $regex: title, $options: 'i' } }), // Case insensitive searching
        ...(tags && { tags: { $in: tags.split(",") } }) // Filtering by multiple tags
    };
    
    try {
        const blogs = await Blog.find(query)
                                .populate('author', 'first_name last_name')
                                .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
                                .limit(Number(limit))
                                .skip((Number(page) - 1) * Number(limit))
                                .exec();
        res.send(blogs);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching blogs', error: error.message });
    }
});

// Get a single published blog by ID
router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('author', 'first_name last_name');
        if (!blog || blog.state !== 'published') {
            return res.status(404).send({ message: 'Blog not found or not published' });
        }
        blog.read_count++;  // Increment read count
        await blog.save();
        res.json(blog);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching blog', error: error.message });
    }
});

// Create a new blog
const { calculateReadingTime } = require('../utils/utils'); // adjust the path as necessary

// When creating or updating a blog post
router.post('/', requireSignin, async (req, res) => {
    const { title, description, body, tags, state = 'draft' } = req.body;
    const readingTime = calculateReadingTime(body);
    
    try {
        const blog = new Blog({
            title,
            description,
            body,
            tags,
            reading_time: readingTime,
            author: req.auth._id,
            state
        });
        await blog.save();
        res.status(201).send({ message: 'Blog created successfully', blog });
    } catch (error) {
        res.status(500).send({ message: 'Error creating blog', error: error.message });
    }
});

router.post('/', requireSignin, async (req, res) => {
    const { title, description, body, tags, state = 'draft' } = req.body;
    try {
        const blog = new Blog({
            title,
            description,
            body,
            tags,
            author: req.auth._id, // Ensuring authorization
            state
        });
        await blog.save();
        res.status(201).send({ message: 'Blog created successfully', blog });
    } catch (error) {
        res.status(500).send({ message: 'Error creating blog', error: error.message });
    }
});

// Update a blog post
router.put('/:id', requireSignin, async (req, res) => {
    const { title, description, body, tags, state } = req.body;
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog || blog.author.toString() !== req.auth._id.toString()) {
            return res.status(401).send({ message: 'Unauthorized' });
        }
        blog.title = title;
        blog.description = description;
        blog.body = body;
        blog.tags = tags;
        blog.state = state;
        await blog.save();
        res.send({ message: 'Blog updated successfully', blog });
    } catch (error) {
        res.status(500).send({ message: 'Error updating blog', error: error.message });
    }
});

// Delete a blog post
router.delete('/:id', requireSignin, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog || blog.author.toString() !== req.auth._id.toString()) {
            return res.status(401).send({ message: 'Unauthorized' });
        }
        await blog.remove();
        res.send({ message: 'Blog deleted successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error deleting blog', error: error.message });
    }
});

// Add a comment to a blog
router.post('/:blogId/comments', requireSignin, async (req, res) => {
    const { text } = req.body;
    try {
        const comment = new Comment({
            text,
            postedBy: req.auth._id,
            blog: req.params.blogId
        });
        await comment.save();
        res.status(201).send({ message: 'Comment added successfully', comment });
    } catch (error) {
        res.status(500).send({ message: 'Error adding comment', error: error.message });
    }
});

module.exports = router;
