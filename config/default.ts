const {
  NODE_ENV,
  PORT,
  POSTGRES_HOST,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_PORT,
  POSTGRES_PROD_DB,
  POSTGRES_TEST_DB,
  POSTGRES_DEV_DB,
  SALT_ROUNDS,
  HOST,
} = process.env;

export default {
  port: PORT,
  NODE_ENV,
  host: HOST,
  database: {
    host: POSTGRES_HOST,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    port: POSTGRES_PORT,
    database:
      NODE_ENV === "test"
        ? POSTGRES_TEST_DB
        : NODE_ENV === "production"
          ? POSTGRES_PROD_DB
          : POSTGRES_DEV_DB,
  },
  bcrypt: {
    SALT_ROUNDS,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRATION,
    emailExpiresIn: process.env.JWT_EMAIL_EXPIRATION,
    bearer: process.env.JWT_BEARER,
  },
  smtp: {
    user: process.env.SMTP_EMAIL,
    password: process.env.SMTP_PASSWORD,
  },
  cloudinary: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    API_KEY: process.env.CLOUDINARY_API_KEY,
    API_SECRET: process.env.CLOUDINARY_API_SECRET,
  },
  PASSWORD_RESET_CODE_LENGTH: process.env.PASSWORD_RESET_CODE_LENGTH,
  passwordResetCodeExpiresIn: process.env.PASSWORD_RESET_CODE_EXPIRES_IN,
};
