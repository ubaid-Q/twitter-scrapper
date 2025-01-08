import Bull from "bull";
import TwitterDataFetcher from "../../src/utils/twitter-scrapper/twitter.scrapper.js";
import { Following } from "../../models/following.model.js";
import { UserFollowing } from "../../models/userFollowings.js";
import { FOLLOWING_OBJ } from "../models.js";

const fetchFollowingsQueue = new Bull("fetchFollowings", {
  redis: { host: "127.0.0.1", port: 6379 },
});

fetchFollowingsQueue.process(async (job) => {
  const { screenName, id, rest_id } = job.data.user;
  const twitterFetcher = new TwitterDataFetcher();

  try {
    console.log(`Fetching followings for screenName: ${screenName}`);

    const restId = rest_id;
    const apiUrl = "https://x.com/i/api/graphql/RXPfhubU4oFPxMBIQlJT3A/Following";

    let cursor = null;
    let hasMoreData = true;

    while (hasMoreData) {
      const { followings, nextCursor } = await twitterFetcher.fetchPaginatedData(restId, apiUrl, cursor);

      for (const following of followings) {
        const [_following] = await Following.findOrCreate({
          where: { screen_name: following.screen_name },
          defaults: Object.assign(
            {},
            ...Object.keys(FOLLOWING_OBJ).map((key) => (key in following ? { [key]: following[key] } : {}))
          ),
        });
        await UserFollowing.upsert({ user_id: id, following_id: _following.id });
      }

      if (nextCursor) {
        cursor = nextCursor;
      } else {
        hasMoreData = false;
      }
    }

    console.log(`Finished fetching followings for screenName: ${screenName}`);
  } catch (error) {
    console.error(`Error fetching followings for screenName: ${screenName}`, error);
    throw error;
  }
});

export { fetchFollowingsQueue };
