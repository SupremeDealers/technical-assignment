import type { Types } from "mongoose";

// * Core User Shape (DB fields)

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// * Public User (API Safe)

export type UserResponse = {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
};

// * Auth Response

export type AuthResponse = {
  user: UserResponse;
  token: string;
};
