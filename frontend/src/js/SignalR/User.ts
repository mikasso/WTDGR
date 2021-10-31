import { store } from "@/store";

export interface User {
  userId: string;
  role?: UserTypes;
  userColor?: string;
}

export function getUserColor() {
  return store.state.user.userColor ?? "black";
}

export enum UserTypes {
  Owner,
}

export function createUser(
  id: string,
  userType: UserTypes = UserTypes.Owner
): User {
  return {
    userId: id,
    role: userType,
    userColor: selectColor(Math.floor(Math.random() * 10)),
  };
}

function selectColor(number: number) {
  const hue = number * 137.508;
  return `hsl(${hue},50%,75%)`;
}
