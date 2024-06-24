import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { signup, signin, validateToken } from "../service/auth";
import User from "../models/user";

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../models/user");

describe("Auth service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("signup", () => {
    it("should create  a new user and return a token", async () => {
      const mockUser = {
        _id: "mockId",
        username: "mockUsername",
        email: "mockEmail",
        password: "mockPassword",
        save: jest.fn(),
      };

      (
        User.findOne as jest.MockedFunction<typeof User.findOne>
      ).mockResolvedValueOnce(null);
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce("mockHashedPassword");
      (User.create as jest.Mock).mockResolvedValueOnce(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue("mockToken");

      const result = await signup("mockUsername", "mockEmail", "mockPassword");

      expect(User.findOne).toHaveBeenCalledWith({ email: "mockEmail" });
      expect(bcrypt.hash).toHaveBeenCalledWith("mockPassword", 10);
      expect(User.create).toHaveBeenCalledWith({
        username: "mockUsername",
        email: "mockEmail",
        password: "mockHashedPassword",
      });
      expect(mockUser.save).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalledWith({ id: mockUser._id }, "secret");
      expect(result).toEqual({ user: mockUser, token: "mockToken" });
    });

    it("should throw an error if the email already exists", async () => {
      (User.findOne as jest.Mock).mockResolvedValueOnce({ email: "mockEmail" });
      await expect(
        signup("mockUsername", "mockEmail", "mockPassword")
      ).rejects.toThrow("Email already exists");
    });
  });

  describe("signin", () => {
    it("should return a token if the user is found and the password is correct", async () => {
      const mockUser = {
        _id: "mockId",
        username: "mockUsername",
        email: "mockEmail",
        password: "mockHashedPassword",
      };

      (User.findOne as jest.Mock).mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      (jwt.sign as jest.Mock).mockReturnValue("mockToken");

      const result = await signin("mockEmail", "mockPassword");

      expect(User.findOne).toHaveBeenCalledWith({
        username: "mockEmail",
        $or: [{ email: "mockEmail" }],
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "mockPassword",
        "mockHashedPassword"
      );
      expect(jwt.sign).toHaveBeenCalledWith({ id: mockUser._id }, "secret");
      expect(result).toEqual({ user: mockUser, token: "mockToken" });
    });

    it("should throw an error if the user is not found", async () => {
      (User.findOne as jest.Mock).mockResolvedValueOnce(null);
      await expect(signin("mockEmail", "mockPassword")).rejects.toThrow(
        "User not found"
      );
    });

    it("should throw an error if the password is incorrect", async () => {
      (User.findOne as jest.Mock).mockResolvedValueOnce({
        password: "mockHashedPassword",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      await expect(signin("mockEmail", "mockPassword")).rejects.toThrow(
        "Password is incorrect"
      );
    });
  });

  describe("validateToken", () => {
    it("should return a user if the token is valid", async () => {
      const mockUser = {
        _id: "mockId",
        username: "mockUsername",
        email: "mockEmail",
      };

      (jwt.verify as jest.Mock).mockReturnValueOnce({ id: "mockId" });
      (User.findById as jest.Mock).mockResolvedValueOnce(mockUser);

      await expect(validateToken("mockToken")).resolves.toEqual(mockUser);
    });

    it("should throw an error if the token is invalid", async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await expect(validateToken("mockToken")).rejects.toThrow("Invalid token");
    });
  });
});
