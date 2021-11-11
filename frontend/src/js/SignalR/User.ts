import { store } from "@/store";

export enum UserRole {
  Owner = "Owner",
  Editor = "Editor",
  Viewer = "Viewer",
}
export interface User {
  id: string;
  role: UserRole;
  userColor: string;
}

export function getUserColor() {
  return store.state.user.userColor ?? "black";
}

export function createUser(
  id: string,
  userRole: UserRole = UserRole.Owner
): User {
  return {
    id: id,
    role: userRole,
    userColor: selectColor(Math.floor(Math.random() * 10)),
  };
}

function selectColor(number: number) {
  const hue = number * 137.508;
  return `hsl(${hue},50%,75%)`;
}
