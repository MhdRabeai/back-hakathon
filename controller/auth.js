const path = require("path");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const nodemailer = require("nodemailer");
const { processResume } = require("../utils/analyzeResume");
const { getDB } = require("../config/db");
const { generateAccessToken } = require("../config/accessToken");
const { ObjectId } = require("mongodb");

require("dotenv").config();
const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
  debug: true,
  logger: true,
});

// ********************************************************************

exports.apply = async (req, res) => {
  const { name, email, gender, phone, locationType, jobTitle, employmentType } =
    req.body;

  console.log(req?.file.path);
  try {
    const user = await getDB().collection("candidate").findOne({ name, email });

    if (await user) {
      return res.status(400).json({ message: "You have already applyed" });
    }
    const analyzedData = await processResume(req.file.path);
    await getDB()
      .collection("candidate")
      .insertOne({
        _id: new ObjectId(),
        name,
        email,
        phone,
        gender,
        locationType,
        jobTitle,
        employmentType,
        cv: req?.file.path,
        experience: analyzedData?.totalExperience || 0,
        skills: analyzedData?.skills || [],
        status: "pendding",
        interview: "",
        createdAt: new Date(),
      });
    return res.status(200).json({ message: "You have been applyed" });
  } catch (err) {
    return res.status(404).json({ message: "Server Error" });
  }
};
exports.firstAccept = async (req, res) => {
  const { id, allDate } = req.body;
  try {
    const user = await getDB()
      .collection("candidate")
      .findOne({ _id: new ObjectId(id) });

    if (!(await user)) {
      return res.status(404).json({ message: "Not Found" });
    }
    await getDB()
      .collection("candidate")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "Before interview", interview: allDate } }
      );
    const mailOptions = {
      from: "mhd.rabea.naser@gmail.com",
      to: user["email"],
      subject: "Principled acceptance",
      text: `Hello ${user["name"]},\n\nYou have been accepted for a job interview\n\nYour interview is scheduled on the date: ${allDate["date"]} ,at the time: ${date["time"]}\n\n You will receive the call room name and password on the scheduled interview day \n\n Thank you for applying with us!`,
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error:", err);
      } else {
        console.log("Email sent:", info.response);
      }
    });
    console.log("Confirmation email sent!");
    return res
      .status(200)
      .json({ message: "Updated and the message has been sent!" });
  } catch (err) {
    return res.status(404).json({ message: "Server Error" });
  }
};
exports.firstReject = async (req, res) => {
  const { id } = req.body;
  try {
    const user = await getDB()
      .collection("candidate")
      .findOne({ _id: new ObjectId(id) });

    if (!(await user)) {
      return res.status(404).json({ message: "Not Found" });
    }
    await getDB()
      .collection("candidate")
      .updateOne({ _id: new ObjectId(id) }, { $set: { status: "rejected" } });
    const mailOptions = {
      from: "mhd.rabea.naser@gmail.com",
      to: user["email"],
      subject: "Principled acceptance",
      text: `Hello ${user["name"]},\n\nWe do not find any vacancies for you currently. \n\nWe have kept your information until there is a vacancy that suits you \n\n Thank you for applying with us!`,
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error:", err);
      } else {
        console.log("Email sent:", info.response);
      }
    });
    console.log("Confirmation email sent!");
    return res
      .status(200)
      .json({ message: "rejected and the message has been sent!" });
  } catch (err) {
    return res.status(404).json({ message: "Server Error" });
  }
};
exports.sendRoomDetails = async (req, res) => {
  const { id } = req.body;
  try {
    const user = await getDB()
      .collection("candidate")
      .findOne({ _id: new ObjectId(id) });

    if (!(await user)) {
      return res.status(404).json({ message: "Not Found" });
    }
    await getDB()
      .collection("candidate")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "interview-process" } }
      );
    const mailOptions = {
      from: "mhd.rabea.naser@gmail.com",
      to: user["email"],
      subject: "Principled acceptance",
      text: `Hello ${user["name"]},\n\nYour VideoCall Name is: ${user["name"]} your password : .... \n\n Thank you for applying with us!`,
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error:", err);
      } else {
        console.log("Email sent:", info.response);
      }
    });
    console.log("Confirmation email sent!");
    return res.status(200).json({ message: " the message has been sent!" });
  } catch (err) {
    return res.status(404).json({ message: "Server Error" });
  }
};
exports.acceptAfterInter = async (req, res) => {
  const { id } = req.body;
  try {
    const user = await getDB()
      .collection("candidate")
      .findOne({ _id: new ObjectId(id) });

    if (!(await user)) {
      return res.status(404).json({ message: "Not Found" });
    }
    await getDB()
      .collection("candidate")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "final approval" } }
      );

    return res.status(200).json({ message: "user has been approved!!" });
  } catch (err) {
    return res.status(404).json({ message: "Server Error" });
  }
};
exports.rejectAfterInter = async (req, res) => {
  const { id } = req.body;
  try {
    const user = await getDB()
      .collection("candidate")
      .findOne({ _id: new ObjectId(id) });

    if (!(await user)) {
      return res.status(404).json({ message: "Not Found" });
    }
    await getDB()
      .collection("candidate")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "Rejected after inter" } }
      );

    return res.status(200).json({ message: "user has been approved!!" });
  } catch (err) {
    return res.status(404).json({ message: "Server Error" });
  }
};
exports.getAllRejectedBeforeInter = async (req, res) => {
  try {
    const users = await getDB()
      .collection("candidate")
      .find({ status: "rejected" })
      .sort({ experience: -1 })
      .toArray();

    return res.status(200).json({ users });
  } catch (err) {
    return res.status(404).json({ message: "Server Error" });
  }
};
exports.getAllRejectedAfterInter = async (req, res) => {
  try {
    const users = await getDB()
      .collection("candidate")
      .find({ status: "Rejected after interview" })
      .sort({ experience: -1 })
      .toArray();

    return res.status(200).json({ users });
  } catch (err) {
    return res.status(404).json({ message: "Server Error" });
  }
};
exports.getAcceptedCandidatesSortedByAllDate = async (req, res) => {
  try {
    const users = await getDB()
      .collection("candidate")
      .aggregate([
        {
          $match: { status: "Before interview" },
        },
        {
          $addFields: {
            fullDate: {
              $toDate: { $concat: ["$allDate.date", "T", "$allDate.time"] },
            },
          },
        },
        {
          $sort: { fullDate: -1 },
        },
      ])
      .toArray();
    return res.status(200).json({ users });
  } catch (err) {
    return res.status(404).json({ message: "Server Error" });
  }
};
exports.getAllInterviews = async (req, res) => {
  try {
    const users = await getDB()
      .collection("candidate")
      .find({ status: { $in: ["final approval", "Rejected after interview"] } })
      .sort({ name: -1 })
      .toArray();
    return res.status(200).json({ users });
  } catch (err) {
    return res.status(404).json({ message: "Server Error" });
  }
};
exports.getAcceptedAfterInter = async (req, res) => {
  try {
    const users = await getDB()
      .collection("candidate")
      .find({ status: "final approval" })
      .sort({ experience: -1 })
      .toArray();
    return res.status(200).json({ users });
  } catch (err) {
    return res.status(404).json({ message: "Server Error" });
  }
};
exports.getAlldCandidates = async (req, res) => {
  try {
    const users = await getDB()
      .collection("candidate")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return res.status(200).json({ users });
  } catch (err) {
    return res.status(404).json({ message: "Server Error" });
  }
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
exports.createRoom = async (req, res) => {
  const { channelName, password } = req.body;
  if (!channelName || !password) {
    return res.status(400).json({ message: "You got wrong data" });
  }
  try {
    const isEx = await getDB().collection("rooms").findOne({ channelName });

    if (await isEx) {
      return res.status(404).json({ message: "The room already exists" });
    }

    const result = await getDB().collection("rooms").insertOne({
      _id: new ObjectId(),
      channelName,
      password,
      createdAt: new Date(),
    });

    if (await result) {
      return res.status(200).json({ message: "Room Created Successfully!!" });
    }

    return res.status(404).json({ message: "Error in Creating Room" });
  } catch (err) {
    console.log(err.message);
    return res.status(404).json({ message: "Server Error" });
  }
};
exports.joinRoom = async (req, res) => {
  const { channelName, password } = req.body;
  if (!channelName || !password) {
    return res.status(400).json({ error: "You got wrong data" });
  }
  try {
    const isEx = await getDB()
      .collection("rooms")
      .findOne({ channelName, password });

    if (!(await isEx)) {
      return res.status(404).json({ message: "Your have wrong data" });
    }

    return res.status(200).json({ message: "Login successful!!" });

    // return res.status(404).json({ message: "Error in Creating Room" });
  } catch (err) {
    console.log(err.message);
    return res.status(404).json({ message: "Server Error" });
  }
};
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  if ((email, password)) {
    console.log(email);
    console.log(password);
    try {
      const result = await getDB()
        .collection("admin")
        .findOne({ email, password });
      console.log(result);
      if (await result) {
        const accessToken = generateAccessToken({
          id: result["_id"],
          role: result["role"],
        });

        res.cookie("access_token", accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
          path: "/",
        });
        console.log("done .. accessToken =>", accessToken);
        return res
          .status(200)
          .json({ message: "Login successful!!", user: result });
      }
      return res.status(404).json({ message: "Not Found" });
    } catch (err) {
      console.log(err.message);
      return res.status(404).json({ message: "Server Error" });
    }
  }
  return res.status(404).json({ message: "Invalid Data" });
};
exports.getData = async (req, res) => {
  const user = await getDB()
    .collection("admin")
    .findOne({}, { _id: new ObjectId(req.user["id"]) });
  if (!user) {
    return res.status(404).json({ message: "Invalid Token" });
  }
  return res.status(200).json({ user, message: "Token is valid" });
};
exports.logout = (req, res) => {
  console.log("Logout");
  res.cookie("access_token", "", { maxAge: 0 });
  res.end();
};
