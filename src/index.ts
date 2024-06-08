import express, { Express } from "express";
import connectDB from "./database/db";

const app: Express = express();
connectDB();

const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
