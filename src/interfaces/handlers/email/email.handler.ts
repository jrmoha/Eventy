import Person from "../../../modules/person/person.model";
import config from "config";
import { sendEmail } from "../../../services/mailer";
import { Token } from "../../../utils/token";
import Ticket from "../../../modules/event/event.tickets.model";
import Order from "../../../modules/order/order.model";
import { SafeString } from "handlebars";
import { htmlToTemplate } from "../../../utils/functions";

type EmailURL = { origin: string };

export const sendResetPasswordEmail = function (
  data: Person,
  { origin }: EmailURL,
) {
  const { id, email, first_name, password_reset_code } = data;

  if (!password_reset_code) return;

  const { signPasswordResetToken } = new Token();
  const payload = {
    id,
    email,
    password_reset_code,
  };
  const token = signPasswordResetToken(payload);

  const config_ = {
    mailserver: {
      service: "gmail",
      auth: {
        user: config.get<string>("smtp.user"),
        pass: config.get<string>("smtp.password"),
      },
    },
    mail: {
      from: `Eventy<${config.get<string>("smtp.user")}>`,
      to: email,
      subject: "Reset password",
      template: "password.reset",
      context: {
        username: `${first_name}`,
        email,
        url: `${origin}/reset-password/${token}`,
      },
    },
  };

  return sendEmail({
    server: config_.mailserver,
    email: config_.mail,
  });
};

export const sendVerificationEmail = function (
  data: Person,
  { origin }: EmailURL,
) {
  const { email, first_name, id } = data;
  const { signEmailToken, signResendEmailToken } = new Token();
  const payload = {
    id,
  };
  const token = signEmailToken(payload);
  const resend_token = signResendEmailToken(payload);

  const config_ = {
    mailserver: {
      service: "gmail",
      auth: {
        user: config.get<string>("smtp.user"),
        pass: config.get<string>("smtp.password"),
      },
    },
    mail: {
      from: `Eventy<${config.get<string>("smtp.user")}>`,
      to: email,
      subject: "Account verification",
      template: "email.verify",
      context: {
        username: `${first_name}`,
        url: `${origin}/email/activate/${token}`,
        resend_url: `${origin}/resend/email/activate/${resend_token}`,
      },
    },
  };

  return sendEmail({
    server: config_.mailserver,
    email: config_.mail,
  });
};

export const sendTicketConfirmationEmail = function (
  user: Person,
  qrcode: string,
  event_name: string,
  event_logo: string,
  order: Order,
  ticket: Ticket,
) {
  const { first_name, email } = user;
  const { quantity, total } = order;
  const { price, class: ticket_class } = ticket;

  const replacements = {
    first_name,
    event_name,
    event_logo: new SafeString(event_logo).toString(),
    quantity,
    total,
    qrcode: new SafeString(qrcode).toString(),
    price,
    ticket_class,
  };

  const html = htmlToTemplate(
    __dirname + "/template/order.confirmation.html",
    replacements,
  );

  const config_ = {
    mailserver: {
      service: "gmail",
      auth: {
        user: config.get<string>("smtp.user"),
        pass: config.get<string>("smtp.password"),
      },
    },
    mail: {
      from: `Eventy<${config.get<string>("smtp.user")}>`,
      to: email,
      attachDataUrls: true,
      subject: "Order Confirmation",
      html: html,
    },
  };

  return sendEmail({
    server: config_.mailserver,
    email: config_.mail,
  });
};
