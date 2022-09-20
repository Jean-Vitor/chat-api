import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { userJoin, getCurrentUser, userLeave, getRoomUsers } from './controllers/users';
import { ClientToServerEvents, ServerToClientEvents } from './types/socket';
import formatMessage from './utils/formatMessage';
import { ClientEvents, ServerEvents } from './constants/events';

require('dotenv').config();

const PORT = process.env.PORT || 3001;
const { APP_URI } = process.env;
const BOT_NAME = 'Chat';

const app = express();
const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: APP_URI,
  },
});

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
  io.listen(3000);
});

// Run when client connects
io.on('connection', (socket) => {
  socket.on(ClientEvents.JOIN_ROOM, ({ username, room }: { username: string; room: string }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit(ServerEvents.MESSAGE, formatMessage(BOT_NAME, `${user.username} has joined the chat`));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(ServerEvents.MESSAGE, formatMessage(BOT_NAME, `${user.username} has joined the chat`));

    // Send users and room info
    io.to(user.room).emit(ServerEvents.UPDATE_USERS, {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chatMessage
  socket.on(ClientEvents.SEND_MESSAGE, (message) => {
    const user = getCurrentUser(socket.id);
    console.log(message, user);
    if (user) {
      io.to(user.room).emit(ServerEvents.MESSAGE, formatMessage(user.username, message));
    }
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(ServerEvents.MESSAGE, formatMessage(BOT_NAME, `${user.username} has left the chat`));

      // Send users and room info
      io.to(user.room).emit(ServerEvents.UPDATE_USERS, {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
