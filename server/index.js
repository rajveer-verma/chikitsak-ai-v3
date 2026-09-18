import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import symptomsRouter from "./routes/symptoms.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
const allowedOrigins = CORS_ORIGIN === "*"
  ? true
  : CORS_ORIGIN.includes(",")
    ? CORS_ORIGIN.split(",").map(o => o.trim())
    : CORS_ORIGIN;

// Middleware
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "chikitsak-ai-backend"
  });
});

// API Routes
app.use("/api", symptomsRouter);

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Backend Error:", err.stack || err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message || "An unexpected error occurred."
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Chikitsak AI Backend is running on http://localhost:${PORT}`);
  console.log(`🩺 Health check available at http://localhost:${PORT}/api/health`);
});

export default app;
