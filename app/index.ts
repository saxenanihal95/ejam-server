import express = require("express");
var mongoose = require("mongoose");
require("dotenv").config();

// Create a new express application instance
const app: express.Application = express();

const username = process.env.MONGO_DB_USER_NAME;
const password = process.env.MONGO_DB_PASSWORD;

const mLabUrl = `mongodb://${username}:${password}@ds357955.mlab.com:57955/ejam-demo`;

mongoose.connect(mLabUrl, { useNewUrlParser: true });

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("connected");
});

app.get("/", function (req, res) {
  res.send("Server Started");
});

app
  .route("/deployment")
  .get(function (req, res) {
    res.send("Get deployement");
  })
  .post(function (req, res) {
    res.send("Add deployment");
  })
  .delete(function (req, res) {
    res.send("Delete deployment");
  });

app.listen(3000, function () {
  console.log("Example app listening on port 3000!");
});
