import nodemailer from "nodemailer";
import { Email, EmailServer } from "../types/email.type";
import hbs from "nodemailer-express-handlebars";
import path from "path";

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

  console.log("Message sent: %s", info);

  return !!info.accepted.length;
};
