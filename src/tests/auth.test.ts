import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { signup, signin } from "../service/auth";
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
  });
});
