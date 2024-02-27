const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

let propertiesReader = require("properties-reader");
let propertiesPath = path.resolve(__dirname, "conf/db.properties");
let properties = propertiesReader(propertiesPath);

let dbPprefix = properties.get("db.prefix");
//URL-Encoding of User and PWD
//for potential special characters
let dbUsername = encodeURIComponent(properties.get("db.user"));
let dbPwd = encodeURIComponent(properties.get("db.pwd"));
let dbName = properties.get("db.dbName");
let dbUrl = properties.get("db.dbUrl");
let dbParams = properties.get("db.params");

const uri = dbPprefix + dbUsername + ":" + dbPwd + dbUrl + dbParams;

// let db;
// const { MongoClient, ServerApiVersion } = require('mongodb');
// //const uri = "mongodb+srv://sm3540:<password>@onlinestore.378jdkw.mongodb.net/?retryWrites=true&w=majority";
// //Create a MongoClient with a MongoClientOptions object to set the Stable API version
//  const client = new MongoClient(uri, { useNewYrlParser:true, useUnifiedTopology: true, ServerApiVersion.v1});
//      client.connect(err =>{
//       const collection= client.db(dbName).collection("lessons");
//       db = client.db(dbName);
//       client.close();

//      });
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);

  const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
  const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
  let db = client.db(dbName);


const app = express();

app.use(cors());

app.set('json spaces', 3);
// app.use(function(req, res, next) {
//     console.log("Incoming request: " + req.url);
//     next();

// });

// app.get("/", function(req, res) {
//     res.send("Welcome to our homepage");

// });





app.set('json spaces', 3);

app.use(cors());

app.use(morgan("short"));

app.use(express.json());

var imagePath = path.resolve(__dirname, "images");
app.use("/images", express.static(imagePath));

app.param('collectionName', function (req, res, next, collectionName) {
  req.collection = db.collection(collectionName);
  return next();
});

app.get('/', function(req, res, next){
  res.send('Select a collection, collection/lessons');
});



app.get('/collections/:collectionName' , function(req, res, next){
  req.collection.find({}).toArray(function(err,results) {
    if (err) {
      return next(err);
    }
    res.send(results);

  });

});
// app.get('/collections/:collectionName' , function(req, res, next){
//   req.collection.find({}, {limit:10, sort:[["price", -1]]}).toArray(function(err,results) {
//     if (err) {
//       return next(err);
//     }
//     res.send(results);

//   });

// });

app.get(
  "/collections/:collectionName/:max/:sortAspect/:sortAscDesc",
  function (req, res, next) {
    // TODO: Validate params
    var max = parseInt(req.params.max, 10); // base 10
    let sortDirection = 1;
    if (req.params.sortAscDesc === "desc") {
      sortDirection = -1;
    }
    req.collection
      .find({}, { limit: max, sort: [[req.params.sortAspect, sortDirection]] })
      .toArray(function (err, results) {
        if (err) {
          return next(err);
        }
        res.send(results);
      });
  }
);


app.get('/collections/:collectionName/:id', function(req, res, next) {
  //{lesson:id}
 req.collection.findOne({ _id: new ObjectId(req.params.id) }, function(err, results) {
 if (err) {
 return next(err);
 }
 res.send(results);
 });
});


app.post('/collections/:collectionName', function(req, res, next) {
 req.collection.insertOne(req.body, function(err, results) {
 if (err) {
 return next(err);
 }
 res.send(results);
 });
});


//curl --header "Content-Type: application/json" --request POST --data "{\"id\": 1002, \"title\": \"Yarn\", \"description\": \"Yarn your cat can play with for a very long time!\", \"price\": 2.99, \"image\": \"images/yarn.jpg\", \"availableInventory\": 7, \"rating\": 3}" http://localhost:3000/collections/products


app.delete("/collections/:collectionName/:id", function (req, res, next) {
  req.collection.deleteOne(
    { _id: new ObjectId(req.params.id) },
    function (err, result) {
      if (err) {
        return next(err);
      } else {
        res.send(
          result.deletedCount === 1 ? { msg: "success" } : { msg: "error" }
        );
      }
    }
  );
});

app.put("/collections/:collectionName/:id", function (req, res, next) {
  // TODO: Validate req.body
  req.collection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: req.body },
    { safe: true, multi: false },
    function (err, result) {
      if (err) {
        return next(err);
      } else {
        res.send(
          result.matchedCount === 1 ? { msg: "success" } : { msg: "error" }
        );
      }
    }
  );
});

//curl --header "Content-Type: application/json" --request PUT --data "{\"id\": 1015, \"title\": \"Yarn2\", \"price\": 10, \"rating\": 5}" http://localhost:3000/collections/products/639b84f126d34097987cf5af


// app.get("/collections/products", function(req, res) {
//     //res.send("The service has been called correctly and it is working");
//     //res.json({result:"ok"})
//     let lessons = [
//       {
//         id: 1,
//         lesson: "Spanish",
//         location: "Barcelona",
//         price: 30,
//         image:'src/images/spanish.png',
//         spaces: 10,
//         availableInventory : 10,
//     },
//     {
//         id: 2,
//         lesson: "History",
//         location: "Cambridge",
//         price: 50,
//         image: "src/images/history.png",
//         spaces: 4,
//         availableInventory : 4,
//     },
//     {
//         id: 3,
//         lesson: "Chemisty",
//         location: "Tokyo",
//         price: 15,
//         image: "src/images/chemisty.jpg",
//         spaces: 7,
//         availableInventory : 7,
//     },
//     {
//         id: 4,
//         lesson: "Physics",
//         location: "Oxford",
//         price: 60,
//         image: "src/images/physics.jpg",
//         spaces: 2,
//         availableInventory : 2,
//     },
//     {
//         id: 5,
//         lesson: "Artificial Intelligence",
//         location: "Prague",
//         price: 70,
//         image: "src/images/artificial intelligence.jpg",
//         spaces: 1,
//         availableInventory : 1,
//     },
//     {
//         id: 6,
//         lesson: "Cooking",
//         location: "Paris",
//         price: 20,
//         image: "src/images/cooking.jpg",
//         spaces: 8,
//         availableInventory : 8,
//     },
//     {
//         id: 7,
//         lesson: "Driving",
//         location: "Hendon",
//         price: 65,
//         image: "src/images/driving.jpg",
//         spaces: 0,
//         availableInventory : 0,
//     },
//     {
//         id: 8,
//         lesson: "Psychology",
//         location: "Liverpool",
//         price: 35,
//         image: "src/images/psychology.jpg",
//         spaces: 2,
//         availableInventory : 2,
//     },
//     {
//         id: 9,
//         lesson: "Astronomy",
//         location: "Amsterdam",
//         price: 25,
//         image: "src/images/astronomy.jpg",
//         spaces: 0,
//         availableInventory : 0,
//     },
//     {
//         id: 10,
//         lesson: "Law",
//         location: "Budapest",
//         price: 80,
//         image: "src/images/law.jpg",
//         spaces: 4,
//         availableInventory : 4,
//     },
//     ];
//     res.json(lessons);
// });

app.get("/", function (req, res) {
  res.send("A GET request, I read and send back the result for you");
});
app.post("/", function (req, res) {
  res.send("a POST request? Let’s create a new element");
});
app.put("/", function (req, res) {
  res.send("Ok, let’s change an element");
});
app.delete("/", function (req, res) {
  res.send("Are you sure??? Ok, let’s delete a record");
});

app.use(function(req,res) {
    res.status(404).send("resource not found");

});

//app.listen(3000, function(){
//    console.log("App started on port 3000");
//});

const port = process.env.PORT || 3000;
app.listen(port, function() {
 console.log("App started on port: " + port);
});