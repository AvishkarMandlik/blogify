const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  let raw = req.headers.authorization;
  let token = raw?.startsWith("Bearer ") ? raw.split(" ")[1] : req.cookies?.token;

  if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ success: false, message: "Unauthorized" });
    req.user = decoded;              
    next();
  });
};
