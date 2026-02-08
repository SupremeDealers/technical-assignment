import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Env } from "../config/configuration";
import prisma from "../lib/prisma";
import { CreateUserDto, LoginUserDto } from "../validators";

export class AuthService {
  async verifyToken({ token }: { token: string }): Promise<{
    user_id: string;
  }> {
    return jwt.verify(token, Env.JWT_ACCESS_SECRET) as { user_id: string };
  }

  private async _generateAccessToken(payload: { user_id: string }) {
    const access_token = jwt.sign(payload, Env.JWT_ACCESS_SECRET, {
      expiresIn: Env.JWT_ACCESS_EXPIRY as any,
    });

    await this._generateRefreshToken(payload);

    return { access_token };
  }

  private async _generateRefreshToken(payload: { user_id: string }) {
    const refresh_token = jwt.sign(
      payload,
      Env.JWT_REFRESH_SECRET || "default_refresh_secret",
      {
        expiresIn: Env.JWT_REFRESH_EXPIRY as any,
      },
    );
    await prisma.user.update({
      where: { user_id: payload.user_id },
      data: { refresh_token: refresh_token },
    });
  }

  private async _verifyAccessToken(token: string) {
    let payload: { user_id: string };
    try {
      payload = jwt.verify(token, Env.JWT_ACCESS_SECRET) as { user_id: string };
    } catch {
      payload = jwt.decode(token) as { user_id: string };
      if (!payload || !payload.user_id) {
        throw new Error("Invalid access token");
      }
    }
    return payload;
  }

  private async _validateUser({ user_id }: { user_id: string }) {
    const user = await prisma.user.findUnique({
      where: { user_id: user_id },
    });
    if (!user) {
      throw new Error("user does not exist");
    }
    return user;
  }

  async register(params: CreateUserDto) {
    try {
      const is_user = await prisma.user.findUnique({
        where: { email: params.email },
      });
      if (is_user) {
        throw new Error("User already exists, proceed to login");
      }
      const password_hash = await bcrypt.hash(params.password, 10);
      const user = await prisma.user.create({
        data: {
          username: params.username,
          email: params.email.toLowerCase(),
          password: password_hash,
        },
      });

      const { access_token } = await this._generateAccessToken({
        user_id: user.user_id,
      });

      return {
        message: "Registration Successful",
        access_token,
        user: {
          user_id: user.user_id,
          email: user.email,
          username: user.username,
        },
      };
    } catch (error: any) {
      if (error.code === "P2002")
        throw new Error("User already exists, proceed to login");
      throw new Error(error.message);
    }
  }

  async login(params: LoginUserDto) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: params.email.toLowerCase() },
      });
      if (!user) {
        throw new Error("User doesn't exist, create an account");
      }
      const isMatch = await bcrypt.compare(params.password, user.password);
      if (!isMatch) throw new Error("Incorrect password");
      const { access_token } = await this._generateAccessToken({
        user_id: user.user_id,
      });

      return {
        message: "Login Successful",
        access_token,
        user: {
          user_id: user.user_id,
          email: user.email,
          username: user.username,
        },
      };
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async logout({ token }: { token: string }) {
    try {
      const payload = await this._verifyAccessToken(token);
      const user = await this._validateUser({ user_id: payload.user_id });

      await prisma.user.update({
        where: { user_id: user.user_id },
        data: { refresh_token: "" },
      });

      return {
        message: "User Logged out successfully",
      };
    } catch (error) {
      console.log("ERROR", error);
      throw new Error("Invalid refresh token");
    }
  }
  async refreshToken({ token }: { token: string }) {
    try {
      const payload = await this._verifyAccessToken(token);
      const user = await this._validateUser({ user_id: payload.user_id });
      if (!user.refresh_token) {
        throw new Error("Invalid User");
      }

      const { access_token } = await this._generateAccessToken({
        user_id: user.user_id,
      });

      return {
        message: "Token refreshed successfully",
        user: {
          user_id: user.user_id,
          email: user.email,
          username: user.username,
        },
        access_token,
      };
    } catch (error) {
      console.log("ERROR", error);
      throw new Error("Invalid refresh token");
    }
  }
}
