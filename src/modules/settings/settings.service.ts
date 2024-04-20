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
}
