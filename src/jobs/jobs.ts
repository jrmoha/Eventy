import { EventService } from "./../modules/event/event.service";
import { UserService } from "./../modules/user/user.service";
import { PersonService } from "./../modules/person/person.service";
import cron from "node-schedule";
import { EventInterestService } from "../modules/event/interest/event.interest";
import { OrderService } from "../modules/order/order.service";
import { sendReminderEmail } from "../interfaces/handlers/email/email.handler";
import Person from "../modules/person/person.model";

export const startJobs = async () => {
  cron.scheduleJob("0 0 * * 0", async () => {
    const PersonServiceInstance = new PersonService();
    const UserServiceInstance = new UserService();
    const unconfirmedUsers = await PersonServiceInstance.getUnconfirmedUsers();

    for (const user of unconfirmedUsers) {
      await UserServiceInstance.deleteUser(user.id);
      await PersonServiceInstance.deletePerson(user.id);
    }
  });

  // Run every day at midnight to send reminder emails to users interested or going to events
  cron.scheduleJob("0 0 * * *", async () => {
    const EventServiceInstance = new EventService();
    const EventInterestServiceInstance = new EventInterestService();
    const OrderServiceInstance = new OrderService();
    const events = await EventServiceInstance.todaysEvents();
    for (const event of events) {
      const interestedUsers =
        await EventInterestServiceInstance.getInterested(event);
      const goingUsers = await OrderServiceInstance.orderBuyers(event);
      const users_set = new Set([
        ...interestedUsers.map((i) => i.user_id),
        ...goingUsers.map((o) => o.user_id),
      ]);
      for (const user_id of users_set) {
        const user = await Person.findOne({ where: { id: user_id } });
        if (!user) continue;
        await sendReminderEmail(user, event);
      }
    }
  });
};
