import express from "express";
import createHttpError from "http-errors";
import ChatsModel from "./model";
import { JWTAuthMiddleware, UserWithRequest } from "../../lib/auth/jwtAuth";

const chatsRouter = express.Router();

chatsRouter.get(
  "/me/chats",
  JWTAuthMiddleware,
  async (req: UserWithRequest, res, next) => {
    try {
      //Returns all the chats in which the user is a member.
      const chats = await ChatsModel.find(
        {
          members: { $in: [req.user?._id] },
        },
        { messages: 0, __v: 0 }
      );
      res.send(chats);
      //NO chat history provided.
    } catch (error) {
      next(error);
    }
  }
);

chatsRouter.post(
  "/me/chats",
  JWTAuthMiddleware,
  async (req: UserWithRequest, res, next) => {
    try {
      if (req.body.receiver) {
        const chats = await ChatsModel.find({
          members: {
            $eq: [req.user?._id, ...req.body.receiver],
          },
        });
        if (chats.length === 0) {
          console.log(chats);
          const newChat = new ChatsModel({
            members: [req.user?._id, ...req.body.receiver],
          });
          const { _id } = await newChat.save();
          res.send({ _id });
        } else {
          res.send(chats);
        }
      } else {
        next(
          createHttpError(400, "Please provide receiver array in the body.")
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

chatsRouter.delete(
  "/me/:chatid",
  JWTAuthMiddleware,
  async (req: UserWithRequest, res, next) => {
    try {
      const updatedChat = await ChatsModel.findByIdAndUpdate(
        req.params.chatid,
        {
          $pull: { members: req.user?._id },
        },
        { new: true }
      );
      if (updatedChat) {
        if (updatedChat.members.length > 0) res.send(updatedChat);
        else {
          const deletedChat = await ChatsModel.findByIdAndDelete(
            req.params.chatid
          );
          res.status(203).send();
        }
      } else {
        next(
          createHttpError(404, `Chat with id ${req.params.chatid} not found!`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// chatsRouter.put(
//   "/test/:chatId",
//   JWTAuthMiddleware,
//   async (req: UserRequest, res, next) => {
//     const updatedChat = await ChatsModel.findByIdAndUpdate(
//       req.params.chatId,
//       {
//         $push: { members: req.body.receiver },
//       },
//       { new: true }
//     );
//     res.send(updatedChat);
//   }
// );

export default chatsRouter;
