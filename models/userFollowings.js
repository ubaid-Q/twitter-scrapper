import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";
import { User } from "./user.model.js";
import { Following } from "./following.model.js";

const UserFollowing = sequelize.define("UserFollowings", {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  following_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});
UserFollowing.belongsTo(User, { foreignKey: "user_id", as: "UserDetail" });
UserFollowing.belongsTo(Following, { foreignKey: "following_id", as: "FollowingDetail" });

User.hasMany(UserFollowing, { foreignKey: "user_id", as: "UserConnections" }); // Unique alias
Following.hasMany(UserFollowing, { foreignKey: "following_id", as: "FollowingConnections" }); // Unique alias

User.belongsToMany(Following, {
  through: UserFollowing,
  foreignKey: "user_id",
  otherKey: "following_id",
  as: "FollowedConnections", // Unique alias for User -> Following
});

Following.belongsToMany(User, {
  through: UserFollowing,
  foreignKey: "following_id",
  otherKey: "user_id",
  as: "UserConnections", // Unique alias for Following -> User
});

export { UserFollowing };
