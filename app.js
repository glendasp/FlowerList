var express = require("express");
var MongoClient = require("mongodb").MongoClient;
var engines = require("jade");
var assert= require('assert');

app = express();

app.set("view engine", "jade");
app.set("views", __dirname + "/views");

MongoClient.connect("mongodb://localhost:27017/garden", function(err, db){

  assert.equal(null, err);  //This will crash the app if there is an error.

  console.log("Connected to MongoDB");

  //routes - only one, to the root /
  app.get('/', function(req, res){

    db.collection('flowers').find({}).toArray(function(err, docs){
      res.render('allflowers', {'flowers' : docs})
    });
  })


  //All other requests, return 404 not found
  app.use(function(req, res){
    res.sendStatus(404);
  });

  //start server
  var server = app.listen(3050, function(){
    var port = server.address().port;
    console.log("Server listening on port "+ port);
  });


});
