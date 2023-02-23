import { Model, Document, ObjectId } from "mongoose";

export interface AppUser {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export interface UserDocument extends AppUser, Document {}

export interface UserModel extends Model<UserDocument> {
  checkCredentials(
    email: string,
    password: string
  ): Promise<UserDocument | null>;
}
