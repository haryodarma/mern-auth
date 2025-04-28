import { NextFunction, Response, Request } from "express";
import { apiRes } from "../utility/resHelper";
import jwt from "jsonwebtoken";

export default async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ ...apiRes.UNAUTHORIZED });

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string);
  if (!decodedToken) return res.status(401).json({ ...apiRes.UNAUTHORIZED });

  next();
}
