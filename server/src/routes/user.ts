import { Router } from "express";
import { getSingleUser } from "../controllers/users";
import verifyToken from "../middlewares/verifyToken";

const userRoutes = Router();

userRoutes.get("/", verifyToken, getSingleUser);

export default userRoutes;
