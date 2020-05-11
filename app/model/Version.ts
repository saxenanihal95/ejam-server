import mongoose from "mongoose";

export interface IVersion extends mongoose.Document {
  name: String;
}

var versionSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    dropDups: true,
  },
  url: String,
});

var Version = mongoose.model<IVersion>("Version", versionSchema);

export default Version;
