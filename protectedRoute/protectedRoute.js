const jwt = require("jsonwebtoken"); // Ensure jwt is required at the top

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]; // Get the token from the Authorization header
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    // If no token is present, return forbidden
    return res.status(403).json({ data: "Forbidden: No token provided" });
  }

  jwt.verify(token, process.env.SECRETKEY, (err, user) => {
    if (err) {
      // If token is invalid, return forbidden
      return res.status(403).json({ data: "Unauthorized: Invalid token" });
    }
    req.user = user; // Attach the user object to the request
    next(); // Pass the execution to the next middleware or route
  });
}

module.exports = authenticateToken;
