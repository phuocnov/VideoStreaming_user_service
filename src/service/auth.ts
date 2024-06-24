import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/user";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

interface AuthResponse {
  user: IUser;
  token: string;
}

export const signup = async (
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const existedUser = await User.findOne({ email: email });
  if (existedUser) {
    throw new Error("Email already exists");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  await user.save();

  const token = jwt.sign({ id: user._id }, JWT_SECRET);

  return { user, token };
};

export const signin = async (
  usernameOrEmail: string,
  password: string
): Promise<AuthResponse> => {
  const user = await User.findOne({
    username: usernameOrEmail,
    $or: [{ email: usernameOrEmail }],
  });
  if (!user) {
    throw new Error("User not found");
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new Error("Password is incorrect");
  }

  return { user, token: jwt.sign({ id: user._id }, JWT_SECRET) };
};

export const validateToken = async (token: string): Promise<IUser> => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id);
    if (!user) {
      // Throw a specific error for user not found to differentiate it from token validation errors
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    } else if (error instanceof Error && error.message === "User not found") {
      throw error;
    } else {
      throw new Error("Authentication failed");
    }
  }
};
