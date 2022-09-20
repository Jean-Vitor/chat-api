export interface User {
  id: string | number;
  username: string;
  room: string;
}

const users: User[] = [];

// Join user to chat
function userJoin(id: string | number, username: string, room: string) {
  const user = { id, username, room };

  users.push(user);

  return user;
}

// Get current user
function getCurrentUser(id: string) {
  return users.find((user) => user.id === id);
}

// User leaves chat
function userLeave(id: string) {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }

  return null;
}

// Get room users
function getRoomUsers(room: string) {
  return users.filter((user) => user.room === room);
}

export { userJoin, getCurrentUser, userLeave, getRoomUsers };
