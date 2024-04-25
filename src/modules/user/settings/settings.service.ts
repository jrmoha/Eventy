import Person from "../../person/person.model";
import Settings from "./settings.model";

export class SettingsService {
  constructor() {}
  public async getSettings(
    user_id: number | undefined,
  ): Promise<Settings | null> {
    return Settings.findOne({
      where: { user_id },
      attributes: { exclude: ["user_id", "createdAt", "updatedAt"] },
    });
  }
  public async setSettings(
    user: Person,
    current_id: number | undefined,
  ): Promise<void> {
    if (current_id == user.id) {
      user.setDataValue("followers_visible", true);
      user.setDataValue("following_visible", true);
      user.setDataValue("friends_visible", true);
      return;
    }
    const settings = await Settings.findOne({
      where: { user_id: user.id },
    });
    if (!settings) return;
    switch (settings?.followers_visibility) {
      case "none":
        user.setDataValue("followers_visible", false);
        break;
      case "friends":
        user.setDataValue(
          "followers_visible",
          !!user.getDataValue("is_friend"),
        );
        break;
      case "anyone":
        user.setDataValue("followers_visible", true);
        break;
      default:
        break;
    }
    switch (settings?.following_visibility) {
      case "none":
        user.setDataValue("following_visible", false);
        break;
      case "friends":
        user.setDataValue(
          "following_visible",
          !!user.getDataValue("is_friend"),
        );
        break;
      case "anyone":
        user.setDataValue("following_visible", true);
        break;
      default:
        break;
    }
    switch (settings?.friends_visibility) {
      case "none":
        user.setDataValue("friends_visible", false);
        break;
      case "friends":
        user.setDataValue("friends_visible", !!user.getDataValue("is_friend"));
        break;
      case "anyone":
        user.setDataValue("friends_visible", true);
        break;
      default:
        break;
    }
    return;
  }
}
