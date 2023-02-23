// import { GoogleStrategy }  from "passport-google-oauth20";
const GoogleStrategy = require("passport-google-oauth20").Strategy;
import UserModel from "../../api/users/model";
import { createAccessToken } from "./tools";

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: `${process.env.BE_URL}/users/googleRedirect`,
  },
  async (_: any, __: any, profile: any, passportNext: any) => {
    try {
      const { email, name } = profile._json;
      const user = await UserModel.findOne({ email });
      if (user) {
        const accessToken = await createAccessToken({
          _id: user._id,
          name: user.name,
        });
        passportNext(null, { accessToken });
      } else {
        const newUser = new UserModel({
          name: name,
          email,
          googleId: profile.id,
        });
        const createdUser = await newUser.save();
        const accessToken = await createAccessToken({
          _id: createdUser._id,
          name: createdUser.name,
        });
        passportNext(null, { accessToken });
      }
    } catch (error) {
      console.log(error);

      passportNext(error);
    }
  }
);

export default googleStrategy;
