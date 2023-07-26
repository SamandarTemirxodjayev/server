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
  fatherName: {
    type: String,
  },
  birth_date: {
    type: String,
  },
  gender: {
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
  }
});
const Users = mongoose.model("users", userSchema);

module.exports = Users;
