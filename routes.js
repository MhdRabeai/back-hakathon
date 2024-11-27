const path = require("path");
const dotenv = require("dotenv");
const {
  register,
  generateToken,
  apply,
  getData,
  adminLogin,
  createRoom,
  joinRoom,
} = require("./controller/auth");
const multer = require("multer");
const { isUser } = require("./middleware/auth");
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
  app.post("/register", upload.single("myfile"), register);
  app.get("/generate-token", generateToken);
  app.post("/apply", upload.single("myfile"), apply);
  app.post("/adminLogin", adminLogin);
  app.get("/checkToken", isUser, getData);
  app.post("/createRoom", isUser, createRoom);
  app.post("/joinRoom", joinRoom);

  // app.get("/download/:filename", (req, res) => {
  //   const filename = req.params.filename;
  //   const filePath = path.join(__dirname, "uploads", filename);

  //   res.download(filePath, (err) => {
  //     if (err) {
  //       res.setHeader("error", "File not found");
  //       return res.status(404).send("File not found");
  //     }
  //   });
  // });
};
