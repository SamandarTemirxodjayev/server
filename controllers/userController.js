const Answers = require("../models/Answers");
const Users = require("../models/Users");
const axios = require("axios");

exports.index = (req, res) => {
  res.json({ message: "Hello World!" });
};
exports.userCreate = async (req, res) => {
  try {
    const user = new Users({
      name: req.body.name,
      surname: req.body.surname,
      fatherName: req.body.fatherName,
      birth_date: req.body.birth_date,
      gender: req.body.gender,
      phone_number: req.body.phone_number,
      id_card: req.body.id_card
    });
    await user.save();
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.usersGet = async (req, res) => {
  try {
    const users = await Users.find();
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.addAnswer = async (req, res) => {
  try {
    const answer = new Answers({
      id: req.body.id,
      text: req.body.text
    });
    await answer.save();
    const user = await Users.findById(req.body.id);
    const sms = [
      {
        phone: user.phone_number,
        text: `Assalomu alaykum ${user.name} ${user.surname}. Sizning Labaratoriyamizdan javobingiz chiqdi. Javobni telegram botimiz orqali bilishingiz mumkin. Telegram botimiz @birbalobot`,
      },
    ];

    const data = new URLSearchParams();
    data.append("login", encodeURIComponent("samandar"));
    data.append("password", encodeURIComponent("gJlv405114TAidbzf9uz"));
    data.append("data", JSON.stringify(sms));

    axios.post("http://185.8.212.184/smsgateway/", data)
      .then((response) => {
        return res.json(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
    return res.json(answer);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.getAnswer = async (req, res) => {
  try {
    const answers = await Answers.find().populate("id");
    return res.json(answers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};