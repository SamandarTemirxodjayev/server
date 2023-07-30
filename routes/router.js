const express = require("express");
const userController = require("../controllers/userController.js");
const router = express.Router();

router.get("/", userController.index);
router.put("/users", userController.userCreate);
router.get("/users", userController.usersGet);
router.get("/answers", userController.getAnswer);
router.put("/answers", userController.addAnswer);
router.post("/answers/:id", userController.getAnswerById);

module.exports = router;
