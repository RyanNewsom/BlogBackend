if (process.env.NODE_ENV !== 'production') require('dotenv').config();

var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

const mongodb = require('mongodb');
const mongoUri = process.env.MONGODB_URI;

/**
 * Returns all blog posts
 */
app.get("/post", function(req, res) {
    console.log("Attempting to return all posts");

    mongodb.connect(mongoUri, function(err, client) {
        if(err) throw err;

        let db = client.db('heroku_6w2wk5lq');
        let posts = db.collection('posts');

        posts.find({}).toArray(function(err, posts) {
            if(err) throw err;

            console.log("Found the following posts");
            console.log(posts)
            
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(posts));
        });
    });
});

/**
 * Returns a post by id
 */
app.get("/post/:id", function(req, res) {
    let id = req.params.id;
    console.log(`Attempting to find post with id: ${id}`);

    mongodb.connect(mongoUri, function(err, client) {
        if(err) throw err;

        let db = client.db('heroku_6w2wk5lq');
        let posts = db.collection('posts');

        posts.findOne({id}, function(err, result) {
            if(err) {
                console.log(`Unable to find post with id: ${id}`);
                throw err;
            }

            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(result));
        });
        
    });
});

/**
 * Adds a blog post to the Mongo DB
 */
app.post("/post", function(req, res) {
    var name = req.body.name;
    var content = req.body.content;
    var subtitle = req.body.subtitle;
    var date = new Date().toISOString().slice(0,10)

    console.log(`Post Received. Contents: \n Name: ${name} Content: ${content} Subtitle: ${subtitle}`);

    if(name && content && subtitle) {
        console.log("Attempting to add blog post to collection");

        mongodb.connect(mongoUri, function(err, client) {
            if(err) throw err;

            let post = {
                date, 
                "id" : `${date}-${name}`,
                name,
                content, 
                subtitle
            }

            console.log(`Post being added: ${post}`);

            let db = client.db('heroku_6w2wk5lq');
            let posts = db.collection('posts');
            
            posts.insert(post, function(err, result) {
                if(err) throw err;

                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(result.ops[0]));
            });
        });
    } else {
        console.log("Blog post is missing required attribute");
        res.statusCode = 500;
        res.send("Missing required property")
    }
});

/**
 * Default error handler
 */
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Internal Server Error')
})

/**
 * Catch all for bad requests
 */
app.get("*", function(req, res) {
    res.send(404, "Sorry, this page does not exist.");
});

/**
 * Init
 */
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Server started");
});
