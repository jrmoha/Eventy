import Person from "../../../modules/person/person.model";
import config from "config";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../../services/mailer";

type EmailURL = { origin: string };

export const sendResetPasswordEmail = function (
  data: Person,
  { origin }: EmailURL,
) {
  const { id, email, first_name, password_reset_code } = data;

  const token = jwt.sign(
    { id, email, password_reset_code },
    config.get<string>("jwt.secret"),
    {
      expiresIn: `${config.get<string>("PASSWORD_RESET_CODE_EXPIRES_IN")}m`,
    },
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

  const token = jwt.sign(
    {
      id,
    },
    config.get<string>("jwt.secret"),
    {
      expiresIn: config.get<string>("jwt.emailExpiresIn"),
    },
  );
  const resend_token = jwt.sign(
    {
      id,
    },
    config.get<string>("jwt.secret"),
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
