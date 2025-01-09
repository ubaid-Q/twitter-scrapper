import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { followingRouter } from "./src/following/router.js";
import { scheduleJobs } from "./utils/jobs/jobScheduler.js";
import sequelize from "./database/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Serve the main HTML page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./public", "index.html"));
});

// Attach routers
app.use("/api/users", followingRouter);

// Start the server
const startServer = async () => {
  try {
    await sequelize.sync();
    console.log("Database synchronized!");
  } catch (error) {
    console.error("Error synchronizing database:", error);
  }

  try {
    scheduleJobs();
    console.log("Jobs scheduled!");
  } catch (error) {
    console.error("Error scheduling jobs:", error);
  }

  try {
    app.listen(8000, () => {
      console.log("Server is running on port 8000");
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};

startServer();
