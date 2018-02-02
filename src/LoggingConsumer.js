/**
 * Created by m1911 on 17/1/12.
 */
import log4js from 'log4js'
import moment from 'moment'
import serialize from 'node-serialize'
import fs from 'fs'

export default class LoggingConsumer {
  constructor(filePath, pm2Mode) {
    this.currentFileName = null
    this.logger = null
    this.logName = "SensorsData.Analytics.LoggingConsumer"
    this.filePrefix = "/service.log.";
    this.initLoggingConsumer(filePath, pm2Mode)
  }

  initLoggingConsumer(filePath, pm2Mode) {
    var reg = new RegExp('/^\/([/w]+\/?)+$/i');
    // if (!reg.exec(filePath)) {
    //   throw new Error('file path error')
    // }
    var fileName = this.constructFilePath()
    // log4js.configure({
    //   "appenders": [
    //     {
    //       "type": "dateFile",
    //       "filename": filePath + this.filePrefix,
    //       "pattern": "yyyyMMdd",
    //       alwaysIncludePattern: true,
    //       "category": this.logName,
    //       layout: {
    //         type: 'pattern',
    //         pattern: '%m'
    //       }
    //     }
    //   ],
    //   pm2: !!pm2Mode
    // });
    fs.existsSync(filePath + this.filePrefix) || fs.mkdirSync(filePath + this.filePrefix)
    log4js.configure({
      appenders: {
        task: {
          "type": "dateFile",
          "filename": filePath + this.filePrefix,
          "pattern": "yyyyMMdd",
          alwaysIncludePattern: true,
          layout: {
            type: 'pattern',
            pattern: '%m'
          }
        }
      },
      categories: {
        default: { appenders: [ 'task' ], level: 'info' }
      },
      pm2: !!pm2Mode
    })
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