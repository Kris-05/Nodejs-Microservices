import jwt from "jsonwebtoken";
import crypto from "crypto";
import RefreshToken from "../models/refreshToken.js"

export const generateTokens = async(user) => {
  const accessToken = jwt.sign({
    userId : user._id,
    username : user.username
  }, process.env.JWT_SECRET, { expiresIn : '60m' });

  const refershToken = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7) // refreshToken expires in 7 days

  await RefreshToken.create({
    token : refershToken,
    user : user._id,
    expiresAt
  });

  return { accessToken, refershToken };
}