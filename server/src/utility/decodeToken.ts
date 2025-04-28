import jwt from "jsonwebtoken";

export default function decodeToken(token: string): jwt.JwtPayload {
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string);
  return decodedToken as jwt.JwtPayload;
}
