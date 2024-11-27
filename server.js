const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./config/db");
require("dotenv").config();
const port = process.env.PRTO || 4000;
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use("/", express.static(path.join(__dirname, "uploads")));

require("./routes")(app);
app.get("/", async (req, res) => {
  res.send("<p>Hello World!!</p>");
});
connectDB().then(() => {
  app.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});
 