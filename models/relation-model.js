const mongoose = require("mongoose");

const relationSchema = new mongoose.Schema({
  ofUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  pairs: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const Relation = mongoose.model("relation", relationSchema);

module.exports = Relation;
