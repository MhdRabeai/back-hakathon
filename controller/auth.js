const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const { MongoClient, ServerApiVersion } = require("mongodb");
const nodemailer = require("nodemailer");
const { processResume } = require("../utils/analyzeResume");

require("dotenv").config();
const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;
const url = process.env.MONGO_URL;
const client = new MongoClient(url, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const db = client.db("hakathon");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
  debug: true,
  logger: true,
});

exports.register = async (req, res) => {
  res.send("Hello World!!");
};
exports.apply = async (req, res) => {
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
