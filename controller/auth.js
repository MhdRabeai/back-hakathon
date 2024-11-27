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
  const { name, email, phone, locationType, jobTitle, employmentType } =
    req.body;
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
        locationType,
        jobTitle,
        employmentType,
        cv: req.file.path,
        experience: analyzedData?.totalExperience || 0,
        skills: analyzedData?.skills || "",
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
  const { id, date } = req.body;
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
        { $set: { status: "Before interview", interview: date } }
      );
    return res.status(200).json({ message: "Updated" });
  } catch (err) {
    return res.status(404).json({ message: "Server Error" });
  }
};
exports.reject = async (req, res) => {
  const { name, email, phone, locationType, jobTitle, employmentType } =
    req.body;
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
        locationType,
        jobTitle,
        employmentType,
        cv: req.file.path,
        experience: analyzedData?.totalExperience || 0,
        skills: analyzedData?.skills || "",
        status: "pendding",
        interview: "",
        createdAt: new Date(),
      });
    return res.status(200).json({ message: "You have been applyed" });
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

// exports.verifyEmail = async (req, res) => {
//   const { email, confirmationCode } = req.body;

//   console.log(confirmationCode.join(""));
//   try {
//     const user = await userCollection.findOne({ email });
//     console.log("user", user);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (typeof user["hashedCode"] !== "string") {
//       console.error("The password to compare must be a string.");
//     } else {
//       bcryptjs.compare(
//         confirmationCode.join(""),
//         user["hashedCode"],
//         async (err, isMatch) => {
//           if (err) {
//             return `Error comparing password: ${err}`;
//           } else {
//             await userCollection.updateOne(
//               { email },
//               { $set: { isActive: true }, $unset: { confirmationCode: "" } }
//             );
//           }
//         }
//       );
//     }
//     console.log("Done");
//     return res.status(200).json({ message: "Email verified successfully!" });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Email verify Faild!!" });
//   }
// };
