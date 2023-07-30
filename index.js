const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const os = require("os");

const router = require("./routes/router.js");

const app = express();
const options = {
  key:fs.readFileSync("./keys/key.pem"),
  cert:fs.readFileSync("./keys/cert.pem")
};

const port = 443;
const telegramPort = 3021;
const defaultPort = 80;

app.use(cors());
app.use(express.json());
app.use("/public", express.static("./public"));
app.use("/api", router);
function getServerIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const interfaceName in interfaces) {
    const iface = interfaces[interfaceName];
    for (const alias of iface) {
      if (alias.family === "IPv4" && alias.internal === false) {
        ips.push(alias.address);
      }
    }
  }
  return ips;
}
mongoose.set("strictQuery", false);
mongoose
  .connect(
    "mongodb://127.0.0.1:27017/labaratoriya?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.10.1",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Server is connecting on MongoDB");
    app.listen(defaultPort, () => {
      console.log(`Server is running on http://localhost:${defaultPort}`);
      const serverIPs = getServerIPs();
      serverIPs.forEach((ip) => {
        console.log(`Server is running on http://${ip}:${defaultPort}`);
      });
      https.createServer(options, app).listen(port, () => {
        console.log("Server is running on https://localhost");
        const serverIPs = getServerIPs();
        serverIPs.forEach((ip) => {
          console.log(`Server is running on https://${ip}`);
        });
        
        app.listen(telegramPort, () => {
          require("./bot.js");
          serverIPs.forEach((ip) => {
            console.log(`TelegramBot is running on http://${ip}:${telegramPort}`);
          });
        });
      });
    });
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });
