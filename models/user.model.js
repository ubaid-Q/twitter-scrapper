import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";

const User = sequelize.define("User", {
  screenName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  profile_image_url_https: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  rest_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
});

export { User };
