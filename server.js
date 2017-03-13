var express = require('express');
var app = express();
var mongo = require('mongodb');
require('dotenv').config({
    silent: true
});

var routes = require('./app/routes.js');

var port = process.env.PORT || 8080;

mongo.MongoClient.connect(process.env.DB, (err, db) => {
    if(err) {
        throw new Error("Failed to connect to database!");
    } else {
        console.log("Made connection with MongoDB");
    }
    
    db.createCollection("sites", {
        capped: true,
        size: 5242880,
        max: 5000
    })
    
    routes(app, db);

    app.listen(port, function() {
        console.log('Node.js listening on port ' + port);
    })
})

