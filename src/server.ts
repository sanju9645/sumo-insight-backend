import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";

import { connectMongoDb } from "./config/mongodb";
import { testConnection } from "./config/mysql";

import userRoute from "./routes/user.route";
import insightRoute from "./routes/insight.route";

const app = express();

/**
 * -------------- GENERAL SETUP ----------------
 */
const PORT: number = parseInt(process.env.PORT || '3000', 10);


/**
 * -------------- MIDDLEWARES ----------------
 */
app.use(cors());
app.use(express.json());


/**
 * -------------- ROUTES ----------------
 */
app.get("/health", async (req: Request, res: Response) => {

  res.send({ message: "health OK! We are in " + process.env.NODE_ENV + " mode" });
});

app.use("/api/user", userRoute);
app.use("/api/insight", insightRoute);


/**
 * -------------- SERVER ----------------
 */
(async () => {
  try {
    // Ensure the connection is successful before starting the server
    await connectMongoDb();
    await testConnection(); // This will throw an error if the connection fails
    console.log("DB connection established, starting server...");

    // Start the server after successful database connection
    app.listen(PORT, () => {
      console.log(`Server started on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to establish connection:", error);
    process.exit(1); // Exit the process if the DB connection fails
  }
})();