import express from "express";
import { signin, signup, validateToken } from "../service/auth";

const router = express.Router();
/**
 * @openapi
 * /auth/health-check:
 *   get:
 *     tags:
 *       - Health Check
 *     description: Check the health of the service
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get("/health-check", (req, res) => {
  res.status(200).send("Service is healthy");
});

/**
 * @openapi
 * /auth/signup:
 *   post:
 *     tags:
 *       - Authentication
 *     description: User signup
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User signup successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await signup(username, email, password);
    res.status(201).json(user);
  } catch (error) {
    let errorMessage = "Something went wrong";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(400).json({ message: errorMessage });
  }
});

/**
 * @openapi
 * /auth/signin:
 *   post:
 *     tags:
 *       - Authentication
 *     description: User signin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usernameOrEmail:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User signup successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                  type: string
 *                  user:
 *                   type: object
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post("/signin", async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    const user = await signin(usernameOrEmail, password);
    res.status(200).json(user);
  } catch (error) {
    let errorMessage = "Something went wrong";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(400).json({ message: errorMessage });
  }
});

/**
 * @openapi
 * /auth/validate-token:
 *   post:
 *     tags:
 *       - Authentication
 *     description: Validates the user's authentication token and returns user information if valid.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The authentication token to be validated.
 *     parameters:
 *       - in: header
 *         name: authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: Authentication token prefixed with 'Bearer '.
 *     responses:
 *       200:
 *         description: Token is valid. Returns user information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The user's unique identifier.
 *                 username:
 *                   type: string
 *                   description: The user's username.
 *                 email:
 *                   type: string
 *                   description: The user's email address.
 *       400:
 *         description: Bad request. Possible reasons include missing token or invalid token format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message explaining the reason for the failure.
 *       401:
 *         description: Unauthorized. The token is invalid or expired.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the token is invalid or expired.
 *     security:
 *       - bearerAuth: []
 */
router.post("/validate-token", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new Error("Token is required");
    }
    const user = await validateToken(token);
    res.status(200).json(user);
  } catch (error) {
    if (error instanceof Error)
      res.status(400).json({ message: error.message });
  }
});

export default router;
