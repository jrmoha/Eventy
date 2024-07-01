import nodemailer from "nodemailer";
import { Email, EmailServer } from "../types/email.type";
import hbs from "nodemailer-express-handlebars";
import path from "path";
import logger from "../log/logger";

export const sendEmail = async ({
  email,
  server,
}: {
  email: Email;
  server: EmailServer;
}) => {
  const transporter = nodemailer.createTransport(server);

  transporter.use(
    "compile",
    hbs({
      viewEngine: {
        partialsDir: path.resolve(
          __dirname,
          "../interfaces/handlers/email/template",
        ),
        defaultLayout: "",
      },
      viewPath: path.resolve(
        __dirname,
        "../interfaces/handlers/email/template",
      ),
      extName: ".hbs",
    }),
  );

  const info = await transporter.sendMail({
    priority: "high",
    attachDataUrls: true,
    ...email,
  });

  logger.info(`Message sent: ${info.accepted}`);

  return !!info.accepted.length;
};
