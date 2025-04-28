import { Router } from "express";
import {
  login,
  logout,
  register,
  resetPassword,
  sendResetOtp,
  sendVerifyOtp,
  verifyEmail,
} from "../controllers/auth";
import verifyToken from "../middlewares/verifyToken";

const authRoutes = Router();

authRoutes.get("/", (req: any, res: any) => res.send("/api/auth"));
authRoutes.post("/login", login);
authRoutes.post("/register", register);
authRoutes.post("/logout", logout);
authRoutes.post("/verify-otp", verifyToken, sendVerifyOtp);
authRoutes.post("/verify-email", verifyToken, verifyEmail);
authRoutes.post("/reset-otp", verifyToken, sendResetOtp);
authRoutes.post("/reset-password", verifyToken, resetPassword);

export default authRoutes;
