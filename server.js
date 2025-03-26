import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import fileUpload from "express-fileupload";

// routes
import assistanceRoute from "./routes/assistance/index.js";
import commandRoute from "./routes/command/index.js";
import authRoute from "./routes/auth/index.js";
import { uploadRouter } from "./routes/upload/index.js";
import emailRoute from "./routes/email/index.js"
import fileChatRoute from './routes/file-chat/index.js'

dotenv.config();

const app = express();

app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(fileUpload());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use("/chat", assistanceRoute);
app.use("/command", commandRoute);
app.use("/upload", uploadRouter);
app.use("/auth", authRoute);
app.use("/email", emailRoute)
app.use("/file-chat", fileChatRoute)

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
