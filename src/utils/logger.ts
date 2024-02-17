import winston from "winston";
import "winston-daily-rotate-file";
const { combine, timestamp, printf, colorize, simple } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

const combinedFileTransport = new winston.transports.DailyRotateFile({
  filename: "logs/combined-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
});

const errorFileTransport = new winston.transports.DailyRotateFile({
  filename: "logs/errors-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
  level: "error",  
});

const logger = winston.createLogger({
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
  transports: [
    combinedFileTransport,
    errorFileTransport,
    new winston.transports.Console({
      format: combine(
        colorize(),
        simple(),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        logFormat,
      ),
    }),
  ],
});

export default logger;
