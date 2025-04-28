import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mainRoutes from "./routes/route";
import { experiment } from "./controllers/auth";
import connectDB from "./configs/mongodb";
import cookieParser from "cookie-parser";

// SERVER
const app = express();

// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
app.use(cookieParser());
dotenv.config();
connectDB();

// ROUTES
app.use("/api", mainRoutes);
app.get("/", experiment);

// RUNNING
app.listen(
  Number(process.env.PORT) || 3000,
  process.env.HOST || "127.0.0.1",
  () => {
    console.log(
      `Server is running on http://${process.env.HOST}:${process.env.PORT}/`
    );
  }
);
