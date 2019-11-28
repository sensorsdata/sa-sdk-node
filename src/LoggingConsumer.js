/**
 * Created by m1911 on 17/1/12.
 */
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

  initLoggingConsumer(filePath, pm2Mode) {
    this.initLoggingConsumer(filePath);
  }

  initLoggingConsumer(filePath) {
    const myFormat = format.printf(({ message }) => {
      return message;
    });
    const saLogConfiguration = {
      transports: [
        new transports.DailyRotateFile({
          filename: filePath + this.filePrefix + "%DATE%",
          datePattern: "YYYYMMDD",
          format: myFormat,
          level: "info",
          zippedArchive: true
        })
      ]
    };
    this.logger = createLogger(saLogConfiguration);
  }

  doFlush() {}

  send(msg) {
    try {
      this.logger.info(JSON.stringify(msg));
    } catch (e) {
      console.error(e);
    }
  }

  close() {
    log4js.shutdown(() => {});
  }

  constructFilePath() {
    return this.filePrefix;
  }
}
