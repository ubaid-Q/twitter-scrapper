import { Router } from "express";
import TwitterDataFetcher from "../utils/twitter-scrapper/twitter.scrapper.js";
import { UserFollowing } from "../../models/userFollowings.js";
import { User } from "../../models/user.model.js";
import { Following } from "../../models/following.model.js";
import sequelize from "../../database/db.js";
import { fetchFollowingsQueue } from "../../utils/Queue/followingQueue.js";

export const followingRouter = Router();

followingRouter.post("/", async (req, res) => {
  const twitterFetcher = new TwitterDataFetcher();
  const data = await twitterFetcher.fetchUserByScreenName(req.body.screenName);
  const {
    legacy: { profile_image_url_https, screen_name },
    rest_id,
  } = data.data.user.result;
  const user = await User.create({ profile_image_url_https, rest_id, screenName: screen_name });
  await fetchFollowingsQueue.add({ user: user.get() }, { attempts: 3, backoff: 5000 });
  return res.status(200).json({ message: "Added in queue for scrapping" });
});

followingRouter.get("/:screenName", async (req, res) => {
  const { screenName } = req.params;
  const twitterFetcher = new TwitterDataFetcher();

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const data = await twitterFetcher.fetchUserByScreenName(screenName);
    const userId = data.data.user.result.rest_id;
    const apiUrl = "https://x.com/i/api/graphql/RXPfhubU4oFPxMBIQlJT3A/Following";

    let cursor = null;
    let hasMoreData = true;

    while (hasMoreData) {
      const { users, nextCursor } = await twitterFetcher.fetchPaginatedData(userId, apiUrl, cursor);

      if (users.length > 0) {
        const message = JSON.stringify({ followings: users });
        res.write(`data: ${message}\n\n`);
      }

      if (nextCursor) {
        cursor = nextCursor;
      } else {
        hasMoreData = false;
        res.write("event: end\n");
        res.write("data: {}\n\n");
        res.end();
      }
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred while fetching data.");
  }
});

followingRouter.delete("/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    await UserFollowing.destroy({ where: { user_id: userId } });
    const userDeletionResult = await User.destroy({ where: { id: userId } });

    if (userDeletionResult === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ message: "User and associated data deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "An error occurred while deleting the user." });
  }
});

followingRouter.get("/", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        "id",
        "screenName",
        "profile_image_url_https",
        [sequelize.fn("COUNT", sequelize.col("FollowedConnections.id")), "followingsCount"],
      ],
      include: {
        model: Following,
        as: "FollowedConnections", // Use the correct alias
        through: { attributes: [] }, // Don't include the intermediate fields in the result
      },
      group: ["User.id"], // Group by user ID to aggregate the followings count
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch followings for a specific user with pagination
followingRouter.get("/:id/followings", async (req, res) => {
  const userId = req.params.id;
  const { page = 1, limit = 5 } = req.query; // Default to page 1 and limit 5 if not provided

  try {
    const followings = await UserFollowing.findAndCountAll({
      where: { user_id: userId },
      include: {
        model: Following,
        as: "FollowingDetail", // Use the correct alias
        // attributes: ["id", "screen_name", "name", "profile_image_url_https"],
      },
      limit,
      offset: (page - 1) * limit, // Pagination logic
    });

    const totalPages = Math.ceil(followings.count / limit);
    res.json({
      followings: followings.rows,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
