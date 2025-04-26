import jwt, { verify } from "jsonwebtoken";
import blacklistedToken from "../models/blacklistedToken";
import User from "../models/user.model.js";

const protect = asyncHandler(async (req, res, next) => {
  const extractTokenFromRequest = (req) => {
    if (req.headers.authorization?.startsWith("Bearer")) {
      return req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      return req.cookies.accessToken;
    } else if (req.cookies?.token) {
      // Legacy support
      return req.cookies.token;
    }
    return null;
  };
  const token = req.cookies.token || extractTokenFromRequest(req);
  if (!token) {
    throw new ApiError(
      401,
      "Not Authorized access route",
      [],
      undefined,
      false
    );
  }
  const isBlacklisted = await blacklistedToken.findOne({ token });
  if (isBlacklisted) {
    throw new ApiError(
      401,
      "Session expired, please login again",
      [],
      undefined,
      false
    );
  }
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded) {
    throw new ApiError(
      401,
      "Not Authorized access route",
      [],
      undefined,
      false
    );
  }
  const user = await User.findById(decoded.id);
});
