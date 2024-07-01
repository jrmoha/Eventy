import { Transaction } from "sequelize";
import Post from "./post.model";

export class PostService {
  constructor() {}
  public async savePost(post: Post, t?: Transaction): Promise<Post> {
    await post.save({ transaction: t });
    return post;
  }
}
