const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // Extract the Authorization header
  const authHeader = req.headers.Authorization || req.headers.authorization;

  // Check if the Authorization header exists and starts with "Bearer"
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1]; // Extract the token after "Bearer"

    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attach the decoded user data to the request object
      console.log("The decoded user is:", req.user);

      next(); // Proceed to the next middleware or route handler
    } catch (err) {
      // Handle token verification failure
      console.error("Token verification error:", err.message);
      return res.status(401).json({ message: "Invalid token" });
    }
  } else {
    // If the Authorization header is missing or not formatted correctly
    return res.status(401).json({ message: "No token, authorization denied" });
  }
};

module.exports = verifyToken;
