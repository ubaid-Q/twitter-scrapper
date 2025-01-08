import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";

const Following = sequelize.define("Following", {
  following: { type: DataTypes.BOOLEAN, allowNull: true },
  can_dm: { type: DataTypes.BOOLEAN, allowNull: true },
  can_media_tag: { type: DataTypes.BOOLEAN, allowNull: true },
  created_at: { type: DataTypes.DATE, allowNull: true },
  default_profile: { type: DataTypes.BOOLEAN, allowNull: true },
  default_profile_image: { type: DataTypes.BOOLEAN, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  favourites_count: { type: DataTypes.INTEGER, allowNull: true },
  followers_count: { type: DataTypes.INTEGER, allowNull: true },
  friends_count: { type: DataTypes.INTEGER, allowNull: true },
  has_custom_timelines: { type: DataTypes.BOOLEAN, allowNull: true },
  is_translator: { type: DataTypes.BOOLEAN, allowNull: true },
  listed_count: { type: DataTypes.INTEGER, allowNull: true },
  location: { type: DataTypes.STRING, allowNull: true },
  media_count: { type: DataTypes.INTEGER, allowNull: true },
  name: { type: DataTypes.STRING, allowNull: true },
  normal_followers_count: { type: DataTypes.INTEGER, allowNull: true },
  possibly_sensitive: { type: DataTypes.BOOLEAN, allowNull: true },
  profile_banner_url: { type: DataTypes.STRING, allowNull: true },
  profile_image_url_https: { type: DataTypes.STRING, allowNull: true },
  screen_name: { type: DataTypes.STRING, allowNull: true, unique: true },
  statuses_count: { type: DataTypes.INTEGER, allowNull: true },
  translator_type: { type: DataTypes.STRING, allowNull: true },
  url: { type: DataTypes.STRING, allowNull: true },
  verified: { type: DataTypes.BOOLEAN, allowNull: true },
  pinned_tweet_ids_str: { type: DataTypes.JSON, allowNull: true },
  withheld_in_countries: { type: DataTypes.JSON, allowNull: true },
});


export { Following };
