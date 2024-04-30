import Organizer from "../organizer/organizer.model";
import { sequelize } from "../../database/index";
import { DataTypes, Model } from "sequelize";
enum PostStatus {
  PUBLISHED = "published",
  DRAFT = "draft",
  DELETED = "deleted",
}
class Post extends Model {
  declare id: number;
  declare content: string;
  declare organizer_id: number;
  declare status: PostStatus;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Post.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    organizer_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        PostStatus.PUBLISHED,
        PostStatus.DRAFT,
        PostStatus.DELETED,
      ),
      allowNull: false,
      defaultValue: "published",
    },
  },
  {
    sequelize,
    modelName: "Post",
    tableName: "posts",
    timestamps: true,
  },
);

Post.belongsTo(Organizer, {
  foreignKey: "organizer_id",
  targetKey: "id",
});
Organizer.hasMany(Post, {
  foreignKey: "organizer_id",
  sourceKey: "id",
});

export default Post;
