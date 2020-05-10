import mongoose from "mongoose";
import { IVersion } from "./Version";

export interface IDeployment extends mongoose.Document {
  url: String;
  templateName: {
    type: String;
    unique: true;
    required: true;
    dropDups: true;
  };
  versions: Array<IVersion>;
  deployedAt: Date;
}

var deploymentSchema = new mongoose.Schema({
  url: String,
  templateName: {
    type: String,
    unique: true,
    required: true,
    dropDups: true,
  },
  versions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Version" }],
  deployedAt: Date,
});

var Deployment = mongoose.model<IDeployment>("Deployment", deploymentSchema);

export default Deployment;
