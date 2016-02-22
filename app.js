var express = require("express");
var MongoClient = require("mongodb").MongoClient;
var engines = require("jade");
var assert= require('assert');
var bodyParser = require('body-parser');



app = express();

app.set("view engine", "jade");
app.set("views", __dirname + "/views");

app.use(express.static("public"));

app.use(bodyParser());


//Attempt to connect to MongoDB.
MongoClient.connect("mongodb://localhost:27017/garden", function(err, db){
  assert.equal(null, err);  //This will crash the app if there is an error.
  console.log("Connected to MongoDB");

  //routes - only one, to the root /
  app.get('/', function(req, res){
    db.collection('flowers').find({}, {"name": true, "color": true}).toArray(function(err, flowerdocs){
      var colordocs = db.collection('flowers').distinct("color", function(err, colordocs){
        res.render('allflowers', {'flowers' : flowerdocs, "flowerColors":colordocs});
      })
    });
  });

  //Form-handling route - show only flowers of selected color
  app.get("/showColors", function(req, res){
    var color = req.query.colorDropDown;
    //Get all of the flowers of the desired color. Only return name and color.
    db.collection('flowers').find({"color": color}, {"name": true, "color": true}).toArray(function(err, docs){
      var colordocs = db.collection('flowers').distinct("color", function(err, colordocs){
        //Turn "red" into "Red"
        var displayColor = color.slice(0,1).toUpperCase() + color.slice(1, color.length)
        res.render('allflowers', {'flowers' : docs, "currentColor": displayColor, "flowerColors":colordocs});
    });
    });
  });

  app.get("/details/:flower", function(req, res){

    var flowerName = req.params.flower //Get value of "flower" param
    //DB query for this flower. Use findOne and note the callback.
    db.collection("flowers").findOne({"name": flowerName}, function(err, doc){
      console.log(doc);
      res.render("flowerDetails", doc)
    })
  });


  app.post("/addNewFlower", function(req, res) {
     console.log(req.body);
     db.collection("flowers").insert(req.body, function(err, result){
      console.log(result);
      res.redirect('/'); //todo send success/fail back to client.
     });

  });


  //All other requests, return 404 not found
  app.use(function(req, res){
    res.sendStatus(404);
  });

  //And start the server
  var server = app.listen(3050, function(){
    var port = server.address().port;
    console.log("Server listening on port "+ port);
  });

});
