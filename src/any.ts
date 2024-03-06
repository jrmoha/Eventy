import Event from "./modules/event/event.model";
import User from "./modules/user/user.model";
import UserCategory from "./modules/category/user.category.model";
import EventCategory from "./modules/category/event.category.model";
import Event_Interest from "./modules/event/event.interest.model";
import Rate from "./modules/rate/rate.model";
import Like from "./modules/like/like.model";
import fs from "fs";
import path from "path";

export const get_data_for_recommendation_json = async () => {
  const result = [];
  const user_arr = [];
  const users = await User.findAll({ attributes: ["id"] });
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const userCategories = await UserCategory.findAll({
      where: {
        user_id: user.id,
      },
    });
    const userCategoriesIds = userCategories.map(
      (userCategory) => userCategory.category,
    );
    const userObject = {
      user_id: user.id,
      preference_categories: userCategoriesIds,
    };
    user_arr.push(userObject);
  }
  result.push(user_arr);
  const events_ = await Event.findAll({ attributes: ["id"] });
  const eventCategoriesData = [];
  for (const e of events_) {
    const categories = await EventCategory.findAll({
      where: { event_id: e.id },
      attributes: ["category"],
    });

    eventCategoriesData.push({
      Event_id: e.id,
      categories: categories.map((category) => category.category),
    });
  }
  result.push(eventCategoriesData);
  const interactionResult = [];
  for (let i = 0; i < users.length; i++) {
    for (const e of events_) {
      const liked = await Like.findOne({
        where: { user_id: users[i].id, event_id: e.id },
      });
      const interest = await Event_Interest.findOne({
        where: { user_id: users[i].id, event_id: e.id },
      });
      const rate = await Rate.findOne({
        where: { user_id: users[i].id, event_id: e.id },
      });
      if (!liked && !interest && !rate) continue;
      interactionResult.push({
        user_id: users[i].id,
        event_id: e.id,
        liked: liked ? 1 : 0,
        interest: interest ? 1 : 0,
        rate: rate ? rate.rate : null,
      });
    }
  }
  result.push(interactionResult);
  fs.writeFileSync(
    path.join(__dirname, "data.json"),
    JSON.stringify(result, null, 2),
  );
};

get_data_for_recommendation_json();
