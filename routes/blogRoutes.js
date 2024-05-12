const express = require('express');
const router = express.Router();
const { requireSignin } = require('../auth/auth');  // Ensure this is defined in your models
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');

// Get all published blogs with pagination and filtering
router.get('/', async (req, res) => {
    const { page = 1, limit = 20, author, title, tags } = req.query;
    const query = {
        state: 'published',
        ...(author && { author }),
        ...(title && { title }),
        ...(tags && { tags: { $in: tags.split(",") } })
    };
    const blogs = await Blog.find(query)
                            .populate('author', 'first_name last_name')
                            .limit(limit * 1)
                            .skip((page - 1) * limit)
                            .exec();
    res.send(blogs);
});

// Get a single published blog by ID
router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('author', 'first_name last_name');
        if (!blog || blog.state !== 'published') {
            return res.status(404).send({ message: 'Blog not found or not published' });
        }
        blog.read_count += 1;  // Increment read count
        await blog.save();
        res.json(blog);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching blog', error: error.message });
    }
});

// Create a new blog
router.post('/', requireSignin, async (req, res) => {
    const { title, description, body, tags } = req.body;
    const blog = new Blog({
        title,
        description,
        body,
        tags,
        author: req.auth._id,  // Assuming req.auth contains authenticated user's ID
        state: 'draft'
    });
    await blog.save();
    res.status(201).send({ message: 'Blog created successfully', blog });
});

// Update a blog post
router.put('/:id', requireSignin, async (req, res) => {
    const { title, description, body, tags, state } = req.body;
    const blog = await Blog.findById(req.params.id);
    if (!blog || blog.author.toString() !== req.auth._id.toString()) {
        return res.status(401).send({ message: 'Blog not found or unauthorized' });
    }
    blog.title = title;
    blog.description = description;
    blog.body = body;
    blog.tags = tags;
    blog.state = state;
    await blog.save();
    res.send({ message: 'Blog updated successfully', blog });
});

// Delete a blog post
router.delete('/:id', requireSignin, async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog || blog.author.toString() !== req.auth._id.toString()) {
        return res.status(401).send({ message: 'Blog not found or unauthorized' });
    }
    await blog.remove();
    res.send({ message: 'Blog deleted successfully' });
});

// Add a comment to a blog
router.post('/:blogId/comments', requireSignin, async (req, res) => {
    const { text } = req.body;
    const comment = new Comment({
        text,
        postedBy: req.auth._id,
        blog: req.params.blogId
    });
    await comment.save();
    res.status(201).send({ message: 'Comment added successfully', comment });
});

module.exports = router;
