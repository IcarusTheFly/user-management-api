export interface UserUpdateProps {
  email?: string;
  name?: string;
  password?: string;
  isAdmin?: boolean;
  createdAt?: string;
}

export interface UserCreateBody {
  email: string;
  password: string;
  name?: string;
  isAdmin?: boolean;
}

export interface UserUpdateBody {
  email?: string;
  password?: string;
  name?: string;
  isAdmin?: boolean;
}

export type UserType = {
  id: number;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
};
