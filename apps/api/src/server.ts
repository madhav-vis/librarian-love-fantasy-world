import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { uploadRouter } from "./routes/upload";
import { quizRouter } from "./routes/quiz";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({ 
    message: "EPUB Visual Novel Quiz API",
    version: "0.1.0",
    endpoints: {
      health: "GET /api/health",
      upload: "POST /api/upload",
      chapters: "GET /api/upload/:bookId/chapters",
      quiz: "GET /api/quiz/:bookId"
    }
  });
});

// Routes
app.use("/api/upload", uploadRouter);
app.use("/api/quiz", quizRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});