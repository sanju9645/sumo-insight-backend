import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction, RequestHandler } from "express";

const handleValidationErrors: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
  } else {
    next();
  }
};

export const validateUserRequest = [
  body("username").isString().notEmpty().withMessage("Username must be a string"),
  handleValidationErrors,
];