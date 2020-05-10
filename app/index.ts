import express = require("express");
let mongoose = require("mongoose");
require("dotenv").config();
import { Deployment, Version } from "./model";
import { IDeployment } from "./model/Deployment";

Array.prototype.flatMap = function (lambda) {
  return Array.prototype.concat.apply([], this.map(lambda));
};

const data: Array<{ name: String; versions: Array<String> }> = [
  {
    name: "Natural One",
    versions: ["1.0.0", "1.0.1", "1.1.0", "2.0.0"],
  },
  {
    name: "Techno 01",
    versions: ["1.0.0", "1.1.1", "2.0.1"],
  },
  {
    name: "Sporty",
    versions: ["1.0.0", "1.1.0", "1.2.0", "1.2.1", "1.3.0", "2.0.0"],
  },
];

// Create a new express application instance
const app: express.Application = express();

const username = process.env.MONGO_DB_USER_NAME;
const password = process.env.MONGO_DB_PASSWORD;

const mLabUrl = `mongodb://${username}:${password}@ds357955.mlab.com:57955/ejam-demo`;

mongoose.connect(mLabUrl, { useNewUrlParser: true });

let db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("connected");
});

const versionList = data.flatMap(({ versions }) => versions);
const versionIds: { [key: string]: number } = {};
let versionPromise = versionList.map(async (name) => {
  try {
    let newVersion = new Version({ name });
    const value = await newVersion.save();
    return Promise.resolve(value);
  } catch (e) {
    const existing = await Version.findOne({ name });
    return Promise.resolve(existing);
  }
});

Promise.all(versionPromise)
  .then(async (v) => {
    v.map(({ _id, name }) => (versionIds[name] = _id));
    await Deployment.remove({});
    data.map(async ({ versions, name: templateName }) => {
      let deployement = new Deployment({ templateName });
      versions.map((v) => deployement.versions.push(versionIds[v]));
      await deployement.save();
    });
  })
  .catch((e) => console.log(e));

app.get("/", function (req, res) {
  res.send("Server Started");
});

app
  .route("/deployment")
  .get(function (req, res) {
    Deployment.find({})
      .populate("versions")
      .exec(function (err: Error, deployements: IDeployment) {
        return res.send(JSON.parse(JSON.stringify(deployements)));
      });
  })
  .post(async function (req, res) {
    try {
      const version = req.body.version;
      const templateName = req.body.templateName;
      const url = req.body.version;
      let deployement = new Deployment({ url, templateName });
      deployement.versions.push(version);
      await deployement.save();
    } catch (e) {
      console.log(e);
    }
  })
  .delete(function (req, res) {
    res.send("Delete deployment");
  });

app.listen(3000, function () {
  console.log("Example app listening on port 3000!");
});
