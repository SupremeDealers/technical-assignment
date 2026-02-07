import { User } from "./auth.model";
import { hashPassword, comparePassword } from "../../utils/hash";
import { signToken } from "../../utils/jwt";
import type { RegisterInput, LoginInput } from "./auth.schema";
import type { AuthResponse, UserResponse, IUser } from "./auth.types";

// * Convert DB user → API safe user

function toUserResponse(user: IUser): UserResponse {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
}

//! * REGISTER

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const email = input.email.toLowerCase().trim();

  // !1. Check existing
  const existingUser = await User.findOne({ email }).lean();
  if (existingUser) {
    throw new Error("User already exists");
  }

  //! 2. Hash password
  const hashedPassword = await hashPassword(input.password);

  //! 3. Create
  const user = await User.create({
    email,
    password: hashedPassword,
    name: input.name.trim(),
  });

  //! 4. Token
  const token = signToken({
    userId: user._id.toString(),
    email: user.email,
  });

  return {
    user: toUserResponse(user.toObject()),
    token,
  };
}

// * LOGIN

export async function login(input: LoginInput): Promise<AuthResponse> {
  const email = input.email.toLowerCase().trim();

  //! 1. Select password explicitly
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new Error("Invalid credentials");
  }

  //! 2. Compare password
  const isValid = await comparePassword(input.password, user.password);
  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  //! 3. Token
  const token = signToken({
    userId: user._id.toString(),
    email: user.email,
  });

  return {
    user: toUserResponse(user.toObject()),
    token,
  };
}
