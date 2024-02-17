import { DataTypes } from "sequelize";
import { sequelize } from "../../database";
import Person from "../person/person.model";
import UserImage from "../image/user.image.model";
import Image from "../image/image.model";
import Block from "../block/block.model";
import Category from "../category/category.model";
import UserCategory from "../category/user.category.model";
import Follow from "../follow/follow.model";
import FriendRequest from "../friendrequest/friendrequest.model";
import Friendship from "../friendship/friendship.model";

class User extends Person {
  declare followers_count: number;
  declare following_count: number;
  declare friends_count: number;
}

User.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    followers_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    following_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    friends_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    tableName: "user",
    modelName: "User",
    sequelize,
  },
);

User.belongsTo(Person, {
  foreignKey: "id",
  targetKey: "id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

User.belongsToMany(User, {
  as: "follow",
  through: Follow,
  foreignKey: "followed_id",
  otherKey: "follower_id",
});

User.belongsToMany(User, {
  as: "friendrequest",
  through: FriendRequest,
  foreignKey: "sender_id",
  otherKey: "receiver_id",
});
User.belongsToMany(User, {
  as: "friendship",
  through: Friendship,
  foreignKey: "sender_id",
  otherKey: "receiver_id",
});
User.belongsToMany(User, {
  as: "block",
  through: Block,
  foreignKey: "blocker_id",
  otherKey: "blocked_id",
});

User.belongsToMany(Category, {
  through: UserCategory,
  foreignKey: "user_id",
  otherKey: "name",
});

User.belongsToMany(Image, {
  through: UserImage,
  foreignKey: "user_id",
  otherKey: "public_id",
});

export default User;
