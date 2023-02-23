import MessagesModel from "../api/messages/model";
interface payload {
  username: String;
  email: String;
  password: String;
}

interface user {
  username: String;
  socketId: String;
}

interface message {
  sender: String;
  content: {
    text: String;
    media: String;
  };
}

let onlineUsers: user[] = [];

export const newConnectionHandler = (newClient: any) => {
  newClient.emit("welcome", { message: `Hello ${newClient.id}` });

  newClient.on("setUsername", (payload: payload) => {
    onlineUsers.push({ username: payload.username, socketId: newClient.id });
  });

  newClient.emit("loggedIn", onlineUsers);

  newClient.on("sendMessage", async (message: message) => {
    newClient.broadcast.emit("newMessage", message);
    const newMessage = new MessagesModel(message);
    const { _id } = await newMessage.save();
  });
};
