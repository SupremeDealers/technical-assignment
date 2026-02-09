import { User } from "../models";
import { generateToken } from "../utils/jwt";
import { RegisterInput, LoginInput } from "../validators/auth.schema";
import { createError } from "../utils/createError";

const authService = {
  async register(data: RegisterInput) {
    const existingUser = await User.findOne({ where: { email: data.email } });

    if (existingUser) {
      throw createError(400, "User with this email already exists");
    }

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    };
  },

  async login(data: LoginInput) {
    const user = await User.findOne({ where: { email: data.email } });

    if (!user) {
      throw createError(401, "Invalid credentials");
    }

    const isPasswordValid = await user.comparePassword(data.password);

    if (!isPasswordValid) {
      throw createError(401, "Invalid credentials");
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    };
  },

  async getMe(userId: string) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw createError(404, "User not found");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  },
};

export default authService;
