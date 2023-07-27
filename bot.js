const TelegramBot = require("node-telegram-bot-api");
const token = "6377123656:AAG9BXLL0SqZUE1XUq48K-020rd3ub8v1c8";
const bot = new TelegramBot(token, { polling: true });
const express = require("express");
const Users = require("./models/Users");
const { default: axios } = require("axios");
const Answers = require("./models/Answers");
const moment = require("moment");
const app = express();

app.listen(3022, () => {
  console.log("Telegram server is running on port 3022");
});
bot.onText(/\/start/, async (msg) => {
  try {
    const user = await Users.findOne({tg_id: msg.chat.id});
    if (!user) {
      await bot.sendMessage(msg.chat.id, "Telefon raqamingizni yuboring", {
        parse_mode: "HTML",
        reply_markup: {
          resize_keyboard: true,
          one_time_keyboard: true,
          keyboard: [
            [
              {
                text: "Telefon raqamni yuborish",
                request_contact: true
              },
            ],
          ]
        }
      });
    }else{
      await bot.sendMessage(msg.chat.id, "Salom", {
        parse_mode: "HTML",
        reply_markup: {
          resize_keyboard: true,
          keyboard: [
            [
              {
                text: "Analiz javoblarini ko'rish",
              },
            ]
          ],
        },
      });
    }
  } catch (error) {
    console.log(error);
  }
});
bot.on("contact", async (msg) => {
  try {
    const { chat, contact } = msg;
    const { phone_number } = contact;
    const user = await Users.findOne({phone_number: phone_number.replace("+", "")});
    if(user){
      user.data = "verification";
      user.tg_id = msg.chat.id;
      let code;
      if (user.verification_code) {
        await bot.sendMessage(chat.id, `Salom ${user.name}, raqamingizni tekshirish uchun sms orqali kelgan kodni kiriting`,{
          reply_markup: {
            remove_keyboard: true,
          }
        });
        return;
      } else {
        code = Math.floor(10000 + Math.random() * 90000);
        user.verification_code = code;
        await user.save();
      }
      const sms = [
        {
          phone: user.phone_number,
          text: `Tasdiqlash kodi ${code}`,
        },
      ];
  
      const data = new URLSearchParams();
      data.append("login", encodeURIComponent("samandar"));
      data.append("password", encodeURIComponent("gJlv405114TAidbzf9uz"));
      data.append("data", JSON.stringify(sms));
  
      axios.post("http://185.8.212.184/smsgateway/", data)
        .then((response) => {
          bot.sendMessage(chat.id, `Salom ${user.name}, raqamingizni tekshirish uchun sms orqali kelgan kodni kiriting`);
          console.log(response.data);
        })
        .catch((error) => {
          bot.sendMessage(chat.id, "Tekshiruv kodini yuborishda xatolik");
          console.log(error);
        });
    }
  } catch (error) {
    console.log(error);
  }
});
bot.on("message", async (msg) => {
  const user = await Users.findOne({ tg_id: msg.chat.id });
  if (user && user.data === "verification") {
    if (msg.text === user.verification_code) {
      user.data = "";
      await user.save();
      await bot.sendMessage(msg.chat.id, "Sizning telefon raqamingiz tasdiqlandi", {
        reply_markup: {
          remove_keyboard: true,
        },
      });
      await bot.sendMessage(msg.chat.id, "Botimizdan foydalanishingiz mumkin", {
        reply_markup: {
          keyboard: [
            [
              {
                text: "Analiz javoblarini ko'rish",
              },
            ]
          ],
        },
      });
    } else {
      await bot.sendMessage(msg.chat.id, "Tekshiruv kodini xato");
    }
    user.verification_code = "";
    await user.save();
  } else {
    console.log("User not found or not in verification state.");
  }
  if (msg.text === "Analiz javoblarini ko'rish") {
    try {
      const user = await Users.findOne({ tg_id: msg.chat.id });
      if (!user) {
        await bot.sendMessage(msg.chat.id, "Foydalanuvchi topilmadi");
        return;
      }

      const answers = await Answers.find({ id: user._id });
      if (!answers || answers.length === 0) {
        await bot.sendMessage(msg.chat.id, "Javoblar topilmadi");
      } else {
        let allAnswersText = "Javoblar:\n";
        answers.forEach((answer) => {
          const formattedDate = moment(answer.date).format("HH:mm DD.MM.YYYY");
          allAnswersText += `\n${answer.text}\nAnaliz javobi chiqqan vaqti: ${formattedDate}\n`;
        });
        await bot.sendMessage(msg.chat.id, allAnswersText);
      }
    } catch (error) {
      console.log(error);
      await bot.sendMessage(msg.chat.id, "Ma'lumotlar olishda xatolik");
    }
  }
});