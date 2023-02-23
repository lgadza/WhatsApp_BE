import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import listEndpoints from "express-list-endpoints";
import {
  badRequestHandler,
  unauthorizedErrorHandler,
  forbiddenErrorHandler,
  notFoundHandler,
  genericErrorHandler,
} from "./errorHandlers";
import usersRouter from "./api/users";
import messagesRouter from "./api/messages";
import chatsRouter from "./api/chats";
import { createServer } from "http";
import { Server } from "socket.io";
import { newConnectionHandler } from "./socket";
import googleStrategy from "./lib/auth/google";
import passport from "passport";

const expressServer = express();

const port = process.env.PORT || 3001;

const httpServer = createServer(expressServer);
const io = new Server(httpServer);

io.on("connection", newConnectionHandler);

passport.use("google", googleStrategy);

expressServer.use(cors());
expressServer.use(express.json());
expressServer.use(passport.initialize());

expressServer.use("/users", usersRouter);
expressServer.use("/chats", chatsRouter);
expressServer.use("/messages", messagesRouter);

expressServer.use(badRequestHandler);
expressServer.use(unauthorizedErrorHandler);
expressServer.use(forbiddenErrorHandler);
expressServer.use(notFoundHandler);
expressServer.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_URL!);

mongoose.connection.on("connected", () => {
  console.log("connected");
  httpServer.listen(port, () => {
    console.table(listEndpoints(expressServer));
    console.log(`Server is running on port ${port}`);
  });
});
