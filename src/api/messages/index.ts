import express from "express";
import MessageModel from "./model";
import ChatsModel from "../chats/model";
import createHttpError from "http-errors";
import { JWTAuthMiddleware, UserWithRequest } from "../../lib/auth/jwtAuth";

const messagesRouter = express.Router();

// ********************************** POST ********************************** */

messagesRouter.post(
  "/:chatId/message",
  JWTAuthMiddleware,
  async (req: UserWithRequest, res, next) => {
    try {
      const chat = await ChatsModel.findById(req.params.chatId);
      if (chat) {
        if (req.body.text || req.body.media) {
          const newMessage = new MessageModel({
            sender: req.user?._id,
            content: req.body,
          });
          const { _id } = await newMessage.save();
          const updatedChat = await ChatsModel.findByIdAndUpdate(
            req.params.chatId,
            { $push: { messages: { _id } } },
            { new: true }
          );
          res.status(201).send({ updatedChat });
        } else {
          next(
            createHttpError(
              400,
              `Please provide either text or media, or both!`
            )
          );
        }
      } else {
        next(
          createHttpError(404, `User with id ${req.params.chatId} not found`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// ************************* GET ALL MESSAGES IN CHAT *********************** */

messagesRouter.get(
  "/:chatId",
  JWTAuthMiddleware,
  async (req: UserWithRequest, res, next) => {
    try {
      const chat = await ChatsModel.findById(req.params.chatId).populate({
        path: "messages",
      });
      if (chat) res.send(chat.messages);
      else {
        next(
          createHttpError(404, `Chat with id ${req.params.chatId} not found`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// ****************************** DELETE MESSAGE **************************** */

messagesRouter.delete(
  "/:chatId/message/:messageId",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const chat = await ChatsModel.findById(req.params.chatId);
      if (chat) {
        const deletedMessage = await MessageModel.findByIdAndDelete(
          req.params.messageId
        );
        if (deletedMessage) {
          const updatedChat = await ChatsModel.findByIdAndUpdate(
            req.params.chatId,
            {
              $pull: { messages: req.params.messageId },
            },
            { new: true }
          );
          console.log(updatedChat);
          res.status(203).send(updatedChat);
        } else {
          next(
            createHttpError(
              404,
              `Message with id ${req.params.messageId} not found!`
            )
          );
        }
      } else {
        next(
          createHttpError(404, `Chat with id ${req.params.chatId} not found!`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default messagesRouter;
