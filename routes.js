const path = require("path");
const dotenv = require("dotenv");
const {
  generateToken,
  apply,
  getData,
  adminLogin,
  createRoom,
  joinRoom,
  reject,
  firstAccept,
  firstReject,
  sendRoomDetails,
  acceptAfterInter,
  getAllRejectedAfterInter,
  getAllInterviews,
  getAcceptedAfterInter,
  getAlldCandidates,
  getAllRejectedBeforeInter,
  logout,
  getAcceptedCandidatesSortedByAllDate,
  rejectAfterInter,
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
  app.post("/apply", upload.single("myfile"), apply);
  app.post("/adminLogin", adminLogin);
  app.post("/createRoom", isUser, createRoom);
  app.post("/joinRoom", joinRoom);
  app.post("/firstAccept", firstAccept);
  app.post("/firstReject", firstReject);
  app.post("/sendRoomDetails", sendRoomDetails);
  app.post("/acceptAfterInter", acceptAfterInter);
  app.post("/rejectAfterInter", rejectAfterInter);
  app.get("/generate-token", generateToken);
  app.get("/checkToken", isUser, getData);
  app.get("/getAllRejectedBeforeInter", getAllRejectedBeforeInter);
  app.get("/getAllRejectedAfterInter", getAllRejectedAfterInter);
  app.get(
    "/getAcceptedCandidatesSortedByAllDate",
    getAcceptedCandidatesSortedByAllDate
  );
  app.get("/getAllInterviews", getAllInterviews);
  app.get("/getAcceptedAfterInter", getAcceptedAfterInter);
  app.get("/getAlldCandidates", getAlldCandidates);

  app.get("/logout", logout);

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
