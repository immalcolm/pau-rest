const express = require("express");
const cors = require("cors");

//setup config
require("dotenv").config(); //process our .env file
const MongoUtil = require("./MongoUtil"); //own module needs ./ to path properly
const { ObjectId } = require("mongodb");

const MONGO_URI = process.env.MONGO_URI;

const app = express();

//ENABLE JSON processing
//result API communicates via the JSON format
//when we send data to the restful api, we use JSON
//reply via JSON
app.use(express.json());

//Enable Cross origin resources sharing
app.use(cors());

async function main() {
  await MongoUtil.connect(MONGO_URI, "foodpanda_pau");

  app.get("/", function (req, res) {
    res.send("Hello world");
  });

  //allow clients to put in new food sightings
  //client to provide the following
  // - description: string
  // - food: array of strings
  // - datetime: date time
  app.post("/food-sightings", async function (req, res) {
    let description = req.body.description;
    let food = req.body.food;

    //if req.body.datetime is in the valid date time (YYYYMMDD)
    //then it will be inserted
    //else we will input via new Date()
    let datetime = new Date(req.body.datetime) || new Date();

    let foodSighting = {
      description: description,
      food: food,
      datetime: datetime,
    };

    //insert into database
    const db = MongoUtil.getDB();

    //add one document to the collection
    const result = await db.collection("sightings").insertOne(foodSighting);

    //reply with OK and the json status
    res.status(200);
    res.send(result);
  });

  //perform simple search
  //
  app.get("/food-sightings", async function (req, res) {
    //start with an empty criteria, get all docs first
    let criteria = {};
    const db = MongoUtil.getDB();

    //query strings are retrieved via req.query
    console.log(req.query);

    //if user specifies query content then we add them in
    //basic search
    if (req.query.description) {
      //adding the `description` key to the criteria object and assign req.query.description
      //criteria["description"] = req.query.description;
      criteria.description = req.query.description;

      criteria.description = {
        $regex: req.query.description, //use regex search
        $options: "i", //ignore case
      };
    }

    if (req.query.food) {
      //searching by array
      //criteria.food = req.query.food;
      criteria.food = {
        $in: [req.query.food],
      };
    }

    if (req.query.datetime) {
    }
    console.log(criteria);
    const result = await db.collection("sightings").find(criteria).toArray();
    res.status(200);
    res.send(result);
  });

  // this route is to update a food sighting by its id
  // PUT /food-sightings/:sighting_id is enough to inform the developer or
  // the reader that this route is to update a food sighting
  app.put("/food-sightings/:sighting_id", async function (req, res) {
    try {
      let { description, food } = req.body;
      let datetime = new Date(req.body.datetime) || new Date();

      // let modifiedDocument = {
      //     "description": description,
      //     "food": food,
      //     "datetime": datetime
      // }
      // we can use the following shortcut if the key name is the same as the variable name
      let modifiedDocument = {
        description,
        food,
        datetime,
      };

      const result = await MongoUtil.getDB()
        .collection("sightings")
        .updateOne(
          {
            _id: ObjectId(req.params.sighting_id),
          },
          {
            $set: modifiedDocument,
          }
        );

      res.status(200);
      res.json({
        message: "Update success",
      });
    } catch (e) {
      res.status(500);
      res.send(e);
      console.log(e);
    }
  });

  app.delete("/food-sightings/:sighting_id", async function (req, res) {
    try {
      await MongoUtil.getDB()
        .collection("sightings")
        .deleteOne({
          _id: ObjectId(req.params.sighting_id),
        });
      res.status(200);
      res.send({ msg: "Data deleted successfully" });
    } catch (e) {
      res.status(500);
    }
  });
}

main();

//begin listening to server
app.listen(3000, function () {
  console.log("Server is connected at port 3000");
});
