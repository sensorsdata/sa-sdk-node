/**
 * Created by m1911 on 17/1/12.
 */
import "core-js";
import { createLogger, format, transports } from "winston";
import "winston-daily-rotate-file";

export default class LoggingConsumer {
  constructor(filePath, pm2Mode) {
    this.currentFileName = null;
    this.logger = null;
    this.logName = "SensorsData.Analytics.LoggingConsumer";
    this.filePrefix = "/service.log.";
    this.initLoggingConsumer(filePath, pm2Mode);
  }

  // eslint-disable-next-line no-unused-vars
  initLoggingConsumer(filePath, pm2Mode) {
    this.initLoggingConsumer(filePath);
  }

  // eslint-disable-next-line no-dupe-class-members
  initLoggingConsumer(filePath) {
    const myFormat = format.printf(({ message }) => message);
    const saLogConfiguration = {
      transports: [
        new transports.DailyRotateFile({
          filename: `${filePath + this.filePrefix}%DATE%`,
          datePattern: "YYYYMMDD",
          format: myFormat,
          level: "info",
          zippedArchive: false,
        }),
      ],
    };
    this.logger = createLogger(saLogConfiguration);
  }

  // eslint-disable-next-line class-methods-use-this
  doFlush() {}

  send(msg) {
    try {
      this.logger.info(JSON.stringify(msg));
    } catch (e) {
      console.error(e);
    }
  }

  close() {
    this.logger.close();
  }

  constructFilePath() {
    return this.filePrefix;
  }
}
