import bcrypt from "bcrypt";

export type UserRole = "admin" | "subscriber";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  pmproLevel: number;
  playlistIds: string[];
}

export interface UserRecord extends UserProfile {
  passwordHash: string;
}

const users: UserRecord[] = [];

function toUserProfile(user: UserRecord): UserProfile {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    pmproLevel: user.pmproLevel,
    playlistIds: [...user.playlistIds]
  };
}

export async function createUser(
  email: string,
  password: string,
  name: string,
  role: UserRole = "subscriber",
  pmproLevel: number = 1,
  id?: string
) {
  const passwordHash = await bcrypt.hash(password, 10);
  const userId = id || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const user: UserRecord = {
    id: userId,
    email,
    name,
    role,
    pmproLevel,
    playlistIds: [],
    passwordHash
  };
  users.push(user);
  return user;
}

export function findUserByEmail(email: string) {
  return users.find((item) => item.email.toLowerCase() === email.toLowerCase()) || null;
}

export function findUserById(id: string) {
  return users.find((item) => item.id === id) || null;
}

export async function verifyPassword(user: UserRecord, password: string) {
  return bcrypt.compare(password, user.passwordHash);
}

export function getAllUsers(): UserProfile[] {
  return users.map(toUserProfile);
}

export function updateUser(id: string, changes: Partial<UserProfile & { password?: string }>) {
  const user = findUserById(id);
  if (!user) return null;

  if (changes.email) user.email = changes.email;
  if (changes.name) user.name = changes.name;
  if (changes.role) user.role = changes.role as UserRole;
  if (typeof changes.pmproLevel === "number") user.pmproLevel = changes.pmproLevel;
  if (Array.isArray(changes.playlistIds)) user.playlistIds = [...changes.playlistIds];

  return toUserProfile(user);
}

export function deleteUser(id: string) {
  const index = users.findIndex((item) => item.id === id);
  if (index === -1) return false;
  users.splice(index, 1);
  return true;
}
