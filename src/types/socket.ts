import { ClientEvents, ServerEvents } from '../constants/events';
import { User } from '../controllers/users';

export interface ServerToClientEvents {
  [ServerEvents.NO_ARG]: () => void;
  [ServerEvents.MESSAGE]: (message: { username: string; text: string; time: Date }) => void;
  [ServerEvents.UPDATE_USERS]: (data: { room: string; users: User[] }) => void;
}

export interface ClientToServerEvents {
  [ClientEvents.JOIN_ROOM]: (user: User) => void;
  [ClientEvents.SEND_MESSAGE]: (message: string) => void;
}

// export interface InterServerEvents {
//   ping: () => void;
// }

// export interface SocketData {
//   name: string;
//   age: number;
// }
