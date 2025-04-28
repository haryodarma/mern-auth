import { Request, Response } from "express";
import decodeToken from "../utility/decodeToken";
import { apiRes } from "../utility/resHelper";
import userModel from "../models/user";

export async function getSingleUser(req: Request, res: Response): Promise<any> {
  const userId = decodeToken(req.cookies.token).id;
  if (!userId)
    return res
      .status(400)
      .json({ ...apiRes.BAD_REQUEST, message: "user id is missing" });

  const user = await userModel.findById(userId);
  if (!user) return res.status(404).json(apiRes.NOT_FOUND);
  return res.status(200).json({ ...apiRes.OK, data: user });
}
