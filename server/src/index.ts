import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// SERVER
const app = express();

// MIDDLEWARE
app.use(express.json());
app.use(cors());
dotenv.config();

// ROUTES

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
