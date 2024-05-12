// Function to calculate reading time of a blog post
function calculateReadingTime(text) {
    const wordsPerMinute = 200; 
    const words = text.split(/\s+/).length; 
    const minutes = words / wordsPerMinute;
    return Math.ceil(minutes); 
}

module.exports = {
    calculateReadingTime
};
