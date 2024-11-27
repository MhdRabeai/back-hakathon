const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const { MongoClient, ServerApiVersion } = require("mongodb");
const nodemailer = require("nodemailer");
const { processResume } = require("../utils/analyzeResume");
const { getDB } = require("../config/db");

require("dotenv").config();
const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;
// const url = process.env.MONGO_URL;
// const client = new MongoClient(url, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });
// const db = client.db("hakathon");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
  debug: true,
  logger: true,
});

// *********

// *********************************************************************
// const user = await userCollection.findOne({ email });

// const userData = {
//   _id: new ObjectId(),
//   name,
//   email,
//   password: hashedPassword,
//   age,
//   gender,
//   phone,
//   avatar: req.file?.filename || "default-avatar.jpg",
//   role,
//   isActive: false,
//   createdAt: new Date(),
// };
// console.log("Inserting user data into database...");
// const userInsertResult = await userCollection.insertOne(userData);
// console.log("Patient data inserted successfully", userInsertResult);
// return res.status(200).json({ message: "User registered successfully" });
// return res.status(500).json({ message: "Server error" });

exports.register = async (req, res) => {
  const {} = req.body;
  // جلب جدول من قاعدة البيانات
  //  await getDB().collection("candidate");
  res.send("Hello World!!");
  // حالة الطلب
  // {
  //   "candidateName": "John Doe",
  //   "email": "john@example.com",
  //   "skills": ["JavaScript", "React", "Node.js"],
  //   "experience": 3,
  //   "resume": "path-to-uploaded-resume.pdf",
  //   "status": "Under Review"
  // }

  // await getDB().collection("candidate").updateOne(
  //   { email },
  //   { $set: { isActive: true }, $unset: { confirmationCode: "" } }
  // );
};
exports.apply = async (req, res) => {
  const { name, email } = req.body;
  console.log(await processResume(req.file.path));
};
exports.generateToken = async (req, res) => {
  const channelName = req.query.channelName;
  const uid = req.query.uid || 0;
  const role = RtcRole.PUBLISHER;
  const expireTime = 3600;

  if (!channelName) {
    return res.status(400).json({ error: "Channel name is required" });
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTimestamp + expireTime;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpireTime
  );

  res.json({ token, uid, channelName });
};
