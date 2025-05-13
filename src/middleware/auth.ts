import { auth } from "express-oauth2-jwt-bearer";
import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

declare global {
  namespace Express {
    interface Request {
      userId: string;
      auth0Id: string;
    }
  }
}

export const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: "RS256",
});

export const jwtParse: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    res.sendStatus(401);
  } else {
    const token = authorization.split(" ")[1];

    try {
      const decoded = jwt.decode(token) as jwt.JwtPayload;
      const auth0Id = decoded.sub;
      const user = await User.findOne({ auth0Id });

      if (user) {
        req.auth0Id = auth0Id as string;
        req.userId = user._id.toString();
        next();
      } else {
        res.sendStatus(401);
      }
    } catch (error) {
      res.sendStatus(401);
    }
  }
};