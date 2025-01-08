import { User } from "../../models/user.model.js";
import { fetchFollowingsQueue } from "../Queue/followingQueue.js";

const scheduleJobs = async () => {
  try {
    const users = await User.findAll();

    for (const user of users) {
      await fetchFollowingsQueue.add({ user: user.get() }, { attempts: 3, backoff: 5000 });
    }

    console.log("Jobs scheduled for all screen names.");
  } catch (error) {
    console.error("Error scheduling jobs:", error);
  }
};

export { scheduleJobs };
