import fetch from "node-fetch";
import { features, headers } from "./api-data.js";

class TwitterDataFetcher {
  constructor() {
    this.features = features;
    this.headers = headers;
  }

  async fetchPaginatedData(userId, apiUrl, cursor = null) {
    try {
      const variables = {
        userId: userId,
        count: 1000,
        includePromotedContent: false,
        cursor: cursor,
      };
      console.log("Fetching data with cursor:", cursor);

      const encodedVariables = encodeURIComponent(JSON.stringify(variables));
      const url = `${apiUrl}?variables=${encodedVariables}&features=${encodeURIComponent(
        JSON.stringify(this.features)
      )}`;

      const response = await fetch(url, {
        method: "GET",
        headers: this.headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error fetching data:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const instruction = data.data.user.result.timeline.timeline.instructions.find(
        (instruction) => instruction.entries
      );

      if (instruction && instruction.entries.length - 2) {
        const users = instruction.entries
          .map((entry) => entry.content.itemContent?.user_results?.result?.legacy)
          .filter(Boolean);

        const cursorEntry = instruction.entries.find((entry) => entry.entryId.startsWith("cursor-bottom"));
        let nextCursor = null;

        if (cursorEntry) {
          nextCursor = cursorEntry.content.value;
          console.log("Next cursor:", nextCursor);
        }

        return { followings: users, nextCursor };
      } else {
        console.log("No entries found.");
        return { followings: [], nextCursor: null };
      }
    } catch (error) {
      console.error("Error during pagination:", error);
      throw new Error("Failed to fetch paginated data.");
    }
  }

  async fetchUserByScreenName(screenName) {
    const res = await fetch(
      `https://x.com/i/api/graphql/QGIw94L0abhuohrr76cSbw/UserByScreenName?variables={"screen_name":"${screenName}"}&features={"hidden_profile_subscriptions_enabled":true,"profile_label_improvements_pcf_label_in_post_enabled":false,"rweb_tipjar_consumption_enabled":true,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"subscriptions_verification_info_is_identity_verified_enabled":true,"subscriptions_verification_info_verified_since_enabled":true,"highlights_tweets_tab_ui_enabled":true,"responsive_web_twitter_article_notes_tab_enabled":true,"subscriptions_feature_can_gift_premium":true,"creator_subscriptions_tweet_preview_api_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"responsive_web_graphql_timeline_navigation_enabled":true}&fieldToggles={"withAuxiliaryUserLabels":false}`,
      { headers: this.headers }
    );
    return await res.json();
  }
}

export default TwitterDataFetcher;
