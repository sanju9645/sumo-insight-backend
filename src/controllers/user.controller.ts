import { Request, Response, RequestHandler } from "express";

import User from "../models/user.model";

const getCurrentUser: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const currentUser = await User.findOne({ _id: req.userId });
    
    if (currentUser) {
      res.json(currentUser);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const createCurrentUser: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { auth0Id, email } = req.body;

    // Parse admin emails from .env
    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((email) => email.trim());

    const existingUser = await User.findOne({ auth0Id });

    if (existingUser) {
      res.status(200).send();
    } else {
      // Check if the email is in the admin email list
      const isAdmin = adminEmails.includes(email);

      // Create a new user with isAdmin flag
      const newUser = new User({
        ...req.body,
        isAdmin,
      });
      await newUser.save();
      res.status(201).json(newUser.toObject());
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating user" });
  }
};

export default {
  getCurrentUser,
  createCurrentUser,
};