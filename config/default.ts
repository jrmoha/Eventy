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
  JWT_SECRET,
  JWT_EXPIRATION,
  JWT_EMAIL_EXPIRATION,
  JWT_BEARER,
  SMTP_EMAIL,
  SMTP_PASSWORD,
  PASSWORD_RESET_CODE_LENGTH,
  PASSWORD_RESET_CODE_EXPIRES_IN,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
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
    secret: JWT_SECRET,
    expiresIn: JWT_EXPIRATION,
    emailExpiresIn: JWT_EMAIL_EXPIRATION,
    bearer: JWT_BEARER,
  },
  smtp: {
    user: SMTP_EMAIL,
    password: SMTP_PASSWORD,
  },
  cloudinary: {
    CLOUD_NAME: CLOUDINARY_CLOUD_NAME,
    API_KEY: CLOUDINARY_API_KEY,
    API_SECRET: CLOUDINARY_API_SECRET,
  },
  PASSWORD_RESET_CODE_LENGTH: PASSWORD_RESET_CODE_LENGTH,
  PASSWORD_RESET_CODE_EXPIRES_IN: PASSWORD_RESET_CODE_EXPIRES_IN,
  maxImageCount: 5,
  images: {
    default_user_image: "eventy/default_user",
    default_group_image: "eventy/kwdmhxefncz67i9mhblr",
    covers_max_length: 5,
  },
};
