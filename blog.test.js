const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); 
const expect = chai.expect;

chai.use(chaiHttp);

describe('Blogs', () => {
    // Test to list all blogs
    it('should list ALL blogs on /blogs GET', (done) => {
        chai.request(app)
            .get('/blogs')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    // Test to retrieve a single blog
    it('should retrieve a single blog on /blogs/:id GET', (done) => {
        const exampleBlogId = 'your_blog_id_here'; 
        chai.request(app)
            .get(`/blogs/${exampleBlogId}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                done();
            });
    });

    // Test to create a blog
    it('should create a blog on /blogs POST', (done) => {
        chai.request(app)
            .post('/blogs')
            .send({
                title: 'New Blog',
                description: 'Test description',
                body: 'Test body content',
                tags: ['test', 'blog']
            })
            .end((err, res) => {
                expect(res).to.have.status(201);
                expect(res.body).to.include.keys('message', 'blog');
                done();
            });
    });

    // Test to update a blog
    it('should update a blog on /blogs/:id PUT', (done) => {
        const exampleBlogId = 'your_blog_id_here'; 
        chai.request(app)
            .put(`/blogs/${exampleBlogId}`)
            .send({ title: 'Updated Title' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.blog.title).to.equal('Updated Title');
                done();
            });
    });

    // Test to delete a blog
    it('should delete a blog on /blogs/:id DELETE', (done) => {
        const exampleBlogId = 'your_blog_id_here'; 
        chai.request(app)
            .delete(`/blogs/${exampleBlogId}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.include({ message: 'Blog deleted successfully' });
                done();
            });
    });

    // Test for unauthorized access to modify a blog
    it('should not allow unauthorized updating on /blogs/:id PUT', (done) => {
        const exampleBlogId = 'your_blog_id_here';
        chai.request(app)
            .put(`/blogs/${exampleBlogId}`)
            .send({ title: 'Unauthorized Update Attempt' })
            .end((err, res) => {
                expect(res).to.have.status(401);
                done();
            });
    });

    // Test for input validation on creating a blog
    it('should validate input when creating a blog on /blogs POST', (done) => {
        chai.request(app)
            .post('/blogs')
            .send({
                title: '', 
                body: 'Body without title'
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
    });
});
