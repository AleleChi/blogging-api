const mongoose = require('mongoose');
const { Schema } = mongoose;

const blogSchema = new Schema({
    title: { type: String, required: true, unique: true },
    description: { type: String },
    body: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [String],
    state: { type: String, enum: ['draft', 'published'], default: 'draft' },
    timestamp: { type: Date, default: Date.now },
    read_count: { type: Number, default: 0 }
});

module.exports = mongoose.model('Blog', blogSchema);
