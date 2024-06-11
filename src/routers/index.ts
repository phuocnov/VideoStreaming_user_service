import express from "express";
import { signin, signup } from "../service/auth";

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

router.get("/test", (req, res) => {
  res.send("Hello from router");
});

export default router;
