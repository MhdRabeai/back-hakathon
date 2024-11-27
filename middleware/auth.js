var jwt = require("jsonwebtoken");
exports.isUser = (req, res, next) => {
  const token = req.cookies["access_token"];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};
