const path = require("path");
const dotenv = require("dotenv");
const { register, generateToken, apply } = require("./controller/auth");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage });
dotenv.config();

module.exports = function (app) {
  app.get("/", async (req, res) => {
    res.send("<p>Hello World!!</p>");
  });

  app.post("/register", upload.single("myfile"), register);
  app.get("/generate-token", generateToken);
  app.post("/apply", upload.single("myfile"), apply);
};
