import nodemailer from "nodemailer";
import { Email, EmailServer } from "../types/email.type";
import hbs from "nodemailer-express-handlebars";

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
        partialsDir: "./src/email/",
        defaultLayout: "",
      },
      viewPath: "./src/email/",
      extName: ".hbs",
    }),
  );

  const info = await transporter.sendMail(email);

  console.log("Message sent: %s", info);

  return !!info.accepted.length;
};
