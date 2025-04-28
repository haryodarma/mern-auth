import { Router } from "express";
import authRoutes from "./auth";
import userRoutes from "./user";

const mainRoutes = Router();

mainRoutes.use("/auth", authRoutes);
mainRoutes.use("/user", userRoutes);

export default mainRoutes;
