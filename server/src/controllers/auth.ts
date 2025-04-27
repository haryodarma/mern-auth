import { Request, Response } from "express";
import { apiRes } from "../utility/resHelper";
import userModel from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateOtpExpireAt, generateOtp } from "../utility/otpHelper";

export async function register(req: Request, res: Response): Promise<any> {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json(apiRes.BAD_REQUEST);

  const existing = await userModel.findOne({
    email: email,
  });

  if (existing)
    return res
      .status(400)
      .json({ ...apiRes.BAD_REQUEST, message: "user already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const userData = new userModel({
    email: email,
    name: name,
    password: hashedPassword,
    verifyOtp: generateOtp(),
    verifyOtExpireAt: generateOtpExpireAt(),
  });

  const token = jwt.sign(
    { id: userData._id },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "7d",
    }
  );

  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  userData.save();

  return res
    .status(200)
    .json({ ...apiRes.OK, data: { ...userData._doc, password: "" } });
}
export async function login(req: Request, res: Response): Promise<any> {
  return res.status(200).json({ ...apiRes.OK, endPoint: "login" });
}
export async function logout(req: Request, res: Response): Promise<any> {
  return res.status(200).json({ ...apiRes.OK, endPoint: "logout" });
}

export async function experiment(req: Request, res: Response): Promise<any> {
  const verificationToken = Math.floor(100000 + Math.random() * 900000);
  const now = Date.now();
  return res.status(200).json({ ...apiRes.OK, verificationToken, now });
}
