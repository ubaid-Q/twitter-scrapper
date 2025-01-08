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
app.use(express.json())
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./public", "index.html"));
});

app.use("/api/users", followingRouter);

(async function () {
  try {
    await sequelize.sync();
    console.log("Database synchronized!");
    app.listen(8000, () => {
      console.log("Server is running");
      scheduleJobs();
    });
  } catch (error) {
    console.error("Error:", error);
  }
})();
