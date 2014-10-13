/* 
 *  Server
 * 
 *  Oded David
 */

var http = require('http'),
    express = require('express'),
    path = require('path'),
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    CollectionDriver = require('./collectionDriver').CollectionDriver;

var fs = require("fs");
var http = require('http');
var app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var mongoHost = 'localhost';
var mongoPort = 27017; 
var collectionDriver;
 
 // Connect to mongoDB
var mongoClient = new MongoClient(new Server(mongoHost, mongoPort));
mongoClient.open(function(err, mongoClient) {
  if (!mongoClient) {
      console.error("Error! Exiting... MongoDB process is down");
      process.exit(1);
  }
  
  // Connect to trackingDB
  var trackingDB = mongoClient.db("tracking");
  trackingCollectionDriver = new CollectionDriver(trackingDB);

  // Connect to advertiserDB
  var advertisersDB = mongoClient.db("advertisers");
  advertisersCollectionDriver = new CollectionDriver(advertisersDB);
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    fs.readFile(__dirname + '/public/reporting.html', 'utf8', function(err, text){
        res.send(text);
    });
});



// Listener to tracking companies
app.get('/postback', function(req, res) {
    var params = req.url;
    var collection = 'postback';

    // parseURL - build JSON object out of string
    // create an array
    var uri = params.slice(params.indexOf('?') + 1).split('&');

    // Build an Object from an Array
    for (var i=0, parameter, object={}; i < uri.length; i++) {
        var parameter = uri[i].split('=');
        object[parameter[0]] = parameter[1];
    }
    
    // Insert to DB collection
    trackingCollectionDriver.save(collection, object, function(err,docs) {
          if (err) { res.status(400).send(err); } 
          else { res.status(201).send(docs); }
     });
});

// API
app.get('/:collection', function(req, res) {
   var params = req.params;
   advertisersCollectionDriver.findAll(req.params.collection, function(error, objs) {
    	  if (error) { res.status(400).send(error); }
	      else { 
	          if (req.accepts('html')) {
    	          res.render('data',{objects: objs, collection: req.params.collection});
              } else {
	          res.set('Content-Type','application/json');
                  res.status(200).send(objs);
              }
         }
   	});
});
 
app.get('/:collection/:entity', function(req, res) {
   var params = req.params;
   var entity = params.entity;
   var collection = params.collection;
   
   console.log("Collection: " + collection + " Entity: " + entity);
   
   if (entity) {
       advertisersCollectionDriver.get(collection, entity, function(error, objs) {
          if (error) { res.status(400).send(error); }
          //else { res.status(200).send(objs); }
          //if (req.accepts('html')) {
    	    //  res.render('data',{objects: objs, collection: req.params.collection});
          else{
	      //res.set('Content-Type','application/json');
              //res.status(200).send(objs);
              res.status(200).jsonp(objs);
              console.log("return json: " + JSON.stringify(objs));
           }
       });
   } else {
      res.send(400, {error: 'bad url', url: req.url});
   }
});

app.post('/:collection', function(req, res) {
    var object = req.body;
    var collection = req.params.collection;
    advertisersCollectionDriver.save(collection, object, function(err,docs) {
          if (err) { res.send(400, err); } 
          else { res.status(201).send(docs); }
     });
});

app.use(function (req,res) {
    res.render('404', {url:req.url});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Server is listening on port ' + app.get('port'));
}); 
