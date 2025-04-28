import { Request, Response } from "express";
import { apiRes } from "../utility/resHelper";
import userModel from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateOtpExpireAt, generateOtp } from "../utility/otpHelper";
import transport from "../configs/email-transport";
import decodeToken from "../utility/decodeToken";

export async function register(req: Request, res: Response): Promise<any> {
  try {
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
      verifyOtpExpireAt: generateOtpExpireAt(),
    });

    const token = jwt.sign(
      { id: userData._id, email: email },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      }
    );
    console.log("everything is fine");
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    userData.save();
    transport.sendMail({
      from: `bluerio <haryo.darmap@gmail.com>`,
      to: email,
      subject: "Login Info",
      text: "Your Register Has Been Successful",
      html: `<h1>Hello ${email}</h1><p>This is a <b>register information</b> from bluerio</p>`,
    });

    return res
      .status(200)
      .json({ ...apiRes.OK, data: { ...userData._doc, password: "" } });
  } catch (e) {
    return res.status(500).json({ ...apiRes.INTERNAL_SERVER_ERROR, e });
  }
}
export async function login(req: Request, res: Response): Promise<any> {
  const { email, password } = req.body;

  if (!email || !password)
    return res
      .status(400)
      .json({ ...apiRes.BAD_REQUEST, message: "email or password is missing" });

  const user = await userModel.findOne({ email: email });

  if (!user) return res.status(404).json(apiRes.NOT_FOUND);

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) return res.status(400).json(apiRes.BAD_REQUEST);

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );
  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    ...apiRes.OK,
    data: {
      id: user._id,
      username: user.name,
      email: user.email,
      isAccountVerified: user.isAccountVerified,
      password: user.password,
    },
  });
}
export async function logout(req: Request, res: Response): Promise<any> {
  res.clearCookie("refreshToken");
  return res.status(200).json({ ...apiRes.OK, endPoint: "logout" });
}
export async function sendVerifyOtp(req: Request, res: Response): Promise<any> {
  try {
    const token = req.cookies.token;

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as jwt.JwtPayload;
    const userId = decodedToken.id;

    if (!userId)
      return res
        .status(400)
        .json({ ...apiRes.BAD_REQUEST, message: "user id is missing" });

    const user = await userModel.findById(userId);

    if (!user) return res.status(404).json(apiRes.NOT_FOUND);

    user.verifyOtp = generateOtp();
    user.verifyOtpExpireAt = generateOtpExpireAt();

    transport.sendMail({
      from: `bluerio <haryo.darmap@gmail.com>`,
      to: user.email,
      subject: "Login Info",
      text: "Your Register Has Been Successful",
      html: `<h1>Hello ${user.email}</h1><p>This is your otp code <b>${user.verifyOtp}</b> from bluerio</p>`,
    });

    await user.save();
    return res.status(200).json({ ...apiRes.OK });
  } catch (e) {
    return res.status(500).json({ ...apiRes.INTERNAL_SERVER_ERROR, e });
  }
}

export async function verifyEmail(req: Request, res: Response): Promise<any> {
  try {
    const userId = decodeToken(req.cookies.token).id;
    const { otp } = req.body;

    if (!userId || !otp)
      return res
        .status(400)
        .json({ ...apiRes.BAD_REQUEST, message: "user id or otp is missing" });

    const user = await userModel.findById(userId);

    if (!user) return res.status(404).json(apiRes.NOT_FOUND);

    if (user.verifyOtp !== otp || user.verifyOtpExpireAt < Date.now())
      return res
        .status(400)
        .json({ ...apiRes.BAD_REQUEST, message: "otp is invalid" });

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;

    await user.save();
    res.clearCookie("otp");
    return res.status(200).json({ ...apiRes.OK });
  } catch (e) {
    return res.status(500).json({ ...apiRes.INTERNAL_SERVER_ERROR });
  }
}

export async function sendResetOtp(req: Request, res: Response): Promise<any> {
  try {
    const decodedToken = decodeToken(req.cookies.token);
    const userId = decodedToken.id;

    if (!userId)
      return res
        .status(400)
        .json({ ...apiRes.BAD_REQUEST, message: "user id is missing" });

    const user = await userModel.findById(userId);

    if (!user) return res.status(404).json(apiRes.NOT_FOUND);

    user.resetOtp = generateOtp();
    user.resetOtpExpireAt = generateOtpExpireAt();

    transport.sendMail({
      from: `bluerio <haryo.darmap@gmail.com>`,
      to: user.email,
      subject: "Reset OTP",
      text: "Use this otp to reset your password",
      html: `<h1>Hello ${user.email}</h1><p>This is your otp code <b>${user.resetOtp}</b> from bluerio</p>`,
    });

    await user.save();
    return res.status(200).json({ ...apiRes.OK });
  } catch (e) {
    return res.status(500).json({ ...apiRes.INTERNAL_SERVER_ERROR, e });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<any> {
  try {
    const { otp, newPassword } = req.body;
    const userId = decodeToken(req.cookies.token).id;

    if (!userId || !otp || !newPassword)
      return res
        .status(400)
        .json({ ...apiRes.BAD_REQUEST, message: "user id or otp is missing" });

    const user = await userModel.findById(userId);

    if (!user) return res.status(404).json(apiRes.NOT_FOUND);
    if (otp !== user.resetOtp || user.resetOtpExpireAt < Date.now())
      return res
        .status(400)
        .json({ ...apiRes.BAD_REQUEST, message: "otp is invalid" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();
    return res.status(200).json({ ...apiRes.OK });
  } catch (e) {}
}
export async function experiment(req: Request, res: Response): Promise<any> {
  try {
    await transport.sendMail({
      from: `Haryo Darma <${process.env.SMTP_USER}>`,
      to: "mlthorfin@gmail.com",
      subject: "Hello from Brevo!",
      text: "This is a test email sent using Nodemailer + Brevo SMTP.",
      html: "<h1>Hello!</h1><p>This is a <b>AKHIRNYAA BERHASILLLLLLLL</b> from Node.js</p>",
    });

    return res.status(200).json({ ...apiRes.OK });
  } catch (e) {
    return res.status(500).json({ ...apiRes.INTERNAL_SERVER_ERROR, e });
  }
}
