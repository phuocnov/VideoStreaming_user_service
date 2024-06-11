import express, { Express } from "express";
import connectDB from "./database/db";
import router from "./routers";
import swaggerDocs from "./util/swagger";

const app: Express = express();

const PORT = 3000;

app.use(express.json());
app.use("/auth", router);

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  await connectDB();
  swaggerDocs(app, PORT);
});
