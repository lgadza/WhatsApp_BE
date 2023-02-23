import express from "express";
import createError from "http-errors";
import UserModel from "./model";
import { createAccessToken } from "../../lib/auth/tools";
import { JWTAuthMiddleware, UserWithRequest } from "../../lib/auth/jwtAuth";

const usersRouter = express.Router();

usersRouter.post("/register", async (req, res, next) => {
  try {
    const newUser = new UserModel(req.body);
    const { _id } = await newUser.save();
    const payload = { _id: newUser._id, name: newUser.name };
    const accessToken = await createAccessToken(payload);
    res
      .status(201)
      .send({ accessToken, _id, message: "You have successfuly registered" });
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.checkCredentials(email, password);
    if (user) {
      const payload = { _id: user._id, name: user.name };
      const accessToken = await createAccessToken(payload);
      res.send({ accessToken });
    } else {
      next(createError(401, "Credentials are not ok!"));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const users = await UserModel.find();
    res.send(users);
  } catch (error) {
    next(error);
  }
});

usersRouter.get(
  "/me",
  JWTAuthMiddleware,
  async (req: UserWithRequest, res, next) => {
    try {
      const user = await UserModel.findById(req.user?._id);
      res.send(user);
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.put(
  "/me",
  JWTAuthMiddleware,
  async (req: UserWithRequest, res, next) => {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        req.user?._id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
      res.send(updatedUser);
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.delete(
  "/me",
  JWTAuthMiddleware,
  async (req: UserWithRequest, res, next) => {
    try {
      await UserModel.findByIdAndDelete(req.user?._id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.get("/:userId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.userId);
    res.send(user);
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/:userId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedUser) {
      res.send(updatedUser);
    } else {
      next(
        createError(404, `Author with id ${req.params.authorId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/:userId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const deletedUser = await UserModel.findByIdAndDelete(req.params.userId);
    if (deletedUser) {
      res.status(204).send();
    } else {
      next(
        createError(404, `Author with id ${req.params.authorId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

export default usersRouter;
