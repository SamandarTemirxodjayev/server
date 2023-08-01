const Answers = require("../models/Answers");
const Users = require("../models/Users");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const multer = require("multer");


exports.index = (req, res) => {
  res.json({ message: "Hello World!" });
};
exports.userCreate = async (req, res) => {
  const { phone_number } = req.body;
  try {
    const userCheck = await Users.findOne({ phone_number: phone_number });
    if (userCheck) {
      return res.status(400).json({ message: "Ushbu telefon raqam orqali ro'yxatdan o'tilgan" });
    }
    const user = new Users({
      name: req.body.name,
      surname: req.body.surname,
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
exports.usersGetById = async (req, res) => {
  try {
    const users = await Users.findById(req.params.id);
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.usersEditById = async (req, res) => {
  try {
    const users = await Users.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        surname: req.body.surname,
        phone_number: req.body.phone_number,
        id_card: req.body.id_card,
        tg_id: ""
      },
    );
    return res.json(users);
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
exports.addAnswer = async (req, res) => {
  try {
    const publicFolderPath = "./public";

    const storage = multer.diskStorage({
      destination: publicFolderPath,
      filename: (req, file, cb) => {
        const fileId = uuidv4();
        const fileExtension = path.extname(file.originalname);
        const fileName = `${fileId}${fileExtension}`;
        cb(null, fileName);
      },
    });

    const upload = multer({ storage }).single("file");
    upload(req, res, async (err) => {
      if (err) {
        console.error("Error handling file upload:", err);
        return res.status(500).json({ message: "Error uploading the file" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }

      const fileId = path.basename(req.file.filename, path.extname(req.file.filename));

      const answer = new Answers({
        id: req.body.id,
        uuid: fileId,
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

      try {
        const response = await axios.post("http://185.8.212.184/smsgateway/", data);
        console.log("SMS sent successfully:", response.data);
      } catch (error) {
        console.error("Error sending SMS:", error);
      }

      return res.status(200).json({ message: "File uploaded", fileId });
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.getAnswerById = async (req, res) => {
  try {
    const answer = await Answers.find({id: req.params.id}).populate("id");
    return res.json(answer);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};