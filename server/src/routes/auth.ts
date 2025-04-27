import { Router } from "express";
import { login, logout, register } from "../controllers/auth";

const authRoutes = Router();

authRoutes.get("/", (req: any, res: any) => res.send("/api/auth"));
authRoutes.post("/login", login);
authRoutes.post("/register", register);
authRoutes.post("/logout", logout);

export default authRoutes;
