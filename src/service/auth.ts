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
