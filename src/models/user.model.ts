import mongoose, { Schema, Document, Model } from "mongoose";
import ArrayConstants from "../classes/Constants";

const profileImgsNameList = ArrayConstants.PROFILE_IMG_NAMES;
const profileImgsCollectionsList = ArrayConstants.PROFILE_IMG_COLLECTIONS;

// Interface for the User document
export interface IUser extends Document {
  _id: string; // Alias for _id
  auth0Id: string;
  email: string;
  name?: string;
  username?: string;
  isAdmin: boolean;
  profilePic: string;
}

// Create the user schema
const userSchema: Schema<IUser> = new Schema({
  auth0Id: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  username: {
    type: String,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  profilePic: {
    type: String,
    default: (): string => {
      const randomCollection =
        profileImgsCollectionsList[
          Math.floor(Math.random() * profileImgsCollectionsList.length)
        ];
      const randomName =
        profileImgsNameList[
          Math.floor(Math.random() * profileImgsNameList.length)
        ];
      return `https://api.dicebear.com/6.x/${randomCollection}/svg?seed=${randomName}`;
    },
  },
});

// Create the User model
const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
