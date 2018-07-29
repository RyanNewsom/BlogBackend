if (process.env.NODE_ENV !== 'production') require('dotenv').config();

var express = require("express");
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

const mongodb = require("mongodb");
const mongoUri = process.env.MONGODB_URI;

mongodb.connect(mongoUri, function(err, result) {
    if(err) throw err;
})

app.get("/post", function(req, res) {
    //return all posts
    res.send("/posts works!");
});

app.get("/post/:id", function(req, res) {
    //get post by id
    res.send("posts for id works!");
});

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

                res.send("Successfully created post!");
            });
        });
    } else {
        console.log("Blog post is missing required attribute");
        res.statusCode = 500;
        res.send("Missing required property")
    }
});

app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Internal Server Error')
})

// catch all
app.get("*", function(req, res) {
    res.send(404, "Sorry, this page does not exist.");
});

//init
app.listen(3000, () => {
    console.log("Server started");
});


