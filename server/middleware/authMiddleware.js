import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization || req.headers.Authorization || req.headers['Authorization'] || req.headers['authorization'];

  if (
    authHeader &&
    authHeader.startsWith("Bearer")
  ) {
    try {
      token = authHeader.split(" ")[1];

      const secret = process.env.JWT_SECRET || "geointelx_default_secret_key_change_in_production";
      const decoded = jwt.verify(token, secret);

      req.user = await User.findById(decoded.id).select("-password");

      return next();
    } catch (error) {
      console.error("AuthMiddleware: Token verification failed:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    console.warn("AuthMiddleware: No token found. Headers received:", JSON.stringify(req.headers, null, 2));
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};
