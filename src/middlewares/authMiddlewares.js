const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Admin = require("../models/Admin");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.Authorization || req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check for user in both collections
      const user = await User.findById(decoded.id);
      const admin = await Admin.findById(decoded.id);

      if (user) {
        req.user = user;
        req.role = "user";
      } else if (admin) {
        req.user = admin;
        req.role = "admin";
      } else {
        return res.status(401).json({ message: "User not found" });
      }

      console.log("Decoded user is:", req.user);
      next();
    } catch (err) {
      console.error("Token verification error:", err.message);
      return res.status(401).json({ message: "Invalid token" });
    }
  } else {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
};

module.exports = verifyToken;
