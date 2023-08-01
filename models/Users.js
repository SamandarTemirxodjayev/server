const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  tg_id: {
    type: String,
    default: "",
  },
  name: {
    type: String,
  },
  surname: {
    type: String,
  },
  phone_number: {
    type: String,
  },
  id_card: {
    type: String,
  },
  verification_code: {
    type: String,
  },
  data: {
    type: String,
    default: "",
  }
});
const Users = mongoose.model("users", userSchema);

module.exports = Users;
