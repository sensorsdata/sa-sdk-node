/**
 * Created by m1911 on 17/1/12.
 */
import log4js from 'log4js'
import moment from 'moment'
import serialize from 'node-serialize'

export default class LoggingConsumer {
  constructor(filePath) {
    this.currentFileName = null
    this.logger = null
    this.logName = "SensorsData.Analytics.LoggingConsumer"
    this.filePrefix = "/service.log.";
    this.initLoggingConsumer(filePath)
  }

  initLoggingConsumer(filePath) {
    var reg = new RegExp('/^\/([/w]+\/?)+$/i');
    // if (!reg.exec(filePath)) {
    //   throw new Error('file path error')
    // }
    var fileName = this.constructFilePath()
    log4js.configure({
      "appenders": [
        {
          "type": "dateFile",
          "filename": filePath + this.filePrefix,
          "pattern": "yyyyMMdd",
          alwaysIncludePattern: true,
          "category": this.logName,
          layout: {
            type: 'pattern',
            pattern: '%m'
          }
        }
      ]
    });
    this.logger = log4js.getLogger(this.logName)
  }

  doFlush() {

  }

  send(msg) {
    try {
      this.logger.info(serialize.serialize(msg))
    } catch (e) {
      console.error(e);
      return;
    }
  }

  close() {
    log4js.shutdown(function () {

    })
  }

  constructFilePath() {
    return this.filePrefix;
  }
}