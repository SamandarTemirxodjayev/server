const mongoose = require("mongoose");

const AnswersSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.ObjectId,
    ref: "users",
  },
  uuid: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  }
});
const Answers = mongoose.model("answer", AnswersSchema);

module.exports = Answers;
