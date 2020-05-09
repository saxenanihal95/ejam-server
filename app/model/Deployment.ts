var mongoose = require("mongoose");

var deploymentSchema = new mongoose.Schema({
  url: String,
  templateName: String,
  version: String,
  deployedAt: Date,
});

var Deployment = mongoose.model("Deployment", deploymentSchema);

export default Deployment;
