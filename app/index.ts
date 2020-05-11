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

app.use(express.json());

const username = process.env.MONGO_DB_USER_NAME;
const password = process.env.MONGO_DB_PASSWORD;

const mLabUrl = `mongodb://${username}:${password}@ds357955.mlab.com:57955/ejam-demo`;

mongoose.connect(mLabUrl, { useNewUrlParser: true });

let db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("connected");
});

const versionList = data.flatMap(
  ({ versions }: { versions: Array<String> }) => versions
);
const versionIds: { [key: string]: number } = {};
let versionPromise = versionList.map(async (name: String) => {
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
    v.filter((obj) => obj).map(({ _id, name }) => (versionIds[name] = _id));
    data.map(async ({ versions, name: templateName }) => {
      try {
        const existingDeployment = await Deployment.findOne({ templateName });
        if (!existingDeployment) {
          let deployment = new Deployment({ templateName });
          versions.map((v) => deployment.versions.push(versionIds[v]));
          await deployment.save();
        }
      } catch (e) {}
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
      .exec(function (err: Error, deployments: IDeployment) {
        return res.send(JSON.parse(JSON.stringify(deployments)));
      });
  })
  .post(async function (req, res) {
    try {
      const version = req.body.version;
      const id = req.body.deploymentId;
      const url = req.body.url;
      const existingVersion = await Version.findOne({ name: version });
      let deployment = await Deployment.findById(id);

      if (!deployment) {
        res.status(400).send({ message: "Deployment template not found" });
      }

      const isVersionExists = deployment?.versions.find((id) =>
        id.equals(existingVersion?._id)
      );

      if (isVersionExists) {
        res.status(400).send({ message: "version already exists" });
      }

      if (existingVersion?._id) {
        deployment?.versions.push(existingVersion?._id);
        await deployment?.save();
        res.status(200).send({ message: "Deployment added succesfully." });
      }

      const newVersion = await new Version({
        name: version,
        ...(url && { url }),
      }).save();

      deployment?.versions.push(newVersion?._id);

      await deployment?.save();

      res.status(200).send({ message: "Deployment added succesfully." });
    } catch (e) {
      res.status(500).send({ message: "Something went wrong." });
    }
  })
  .put(async function (req, res) {
    try {
      const removeVersionId = req.body.versionId;
      const deployementVersionId = req.body.deploymentId;
      let deployment = await Deployment.findById(deployementVersionId);

      if (!deployment) {
        res.status(400).send({ message: "Deployment template not found" });
      }

      const isVersionExists = deployment?.versions.find((id) =>
        id.equals(removeVersionId)
      );

      if (!isVersionExists) {
        res.status(400).send({ message: "version doesn't on given template" });
      }

      await Deployment.updateOne(
        { _id: deployementVersionId },
        { $pullAll: { versions: [removeVersionId] } }
      );

      res.status(200).send({ message: "Verison removed succesfully." });
    } catch (e) {
      console.log(e);
      res.status(500).send({ message: "Something went wrong." });
    }
  });

app.listen(8000, function () {
  console.log("Example app listening on port 8000!");
});
