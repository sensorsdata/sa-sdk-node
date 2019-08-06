"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _log4js = _interopRequireDefault(require("log4js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// import moment from 'moment'
// import serialize from 'node-serialize'
// import fs from 'fs'
let LoggingConsumer =
/*#__PURE__*/
function () {
  function LoggingConsumer(filePath, pm2Mode) {
    _classCallCheck(this, LoggingConsumer);

    this.currentFileName = null;
    this.logger = null;
    this.logName = 'SensorsData.Analytics.LoggingConsumer';
    this.filePrefix = '/service.log.';
    this.initLoggingConsumer(filePath, pm2Mode);
  }

  _createClass(LoggingConsumer, [{
    key: "initLoggingConsumer",
    value: function initLoggingConsumer(filePath, pm2Mode) {
      // const reg = new RegExp('/^/([/w]+/?)+$/i')
      // if (!reg.exec(filePath)) {
      //   throw new Error('file path error')
      // }
      // const fileName = this.constructFilePath()
      _log4js.default.configure({
        appenders: {
          task: {
            type: 'dateFile',
            filename: filePath + this.filePrefix,
            pattern: 'yyyyMMdd',
            alwaysIncludePattern: true,
            layout: {
              type: 'pattern',
              pattern: '%m'
            }
          }
        },
        categories: {
          default: {
            appenders: ['task'],
            level: 'info'
          }
        },
        pm2: !!pm2Mode
      });

      this.logger = _log4js.default.getLogger(this.logName);
    }
  }, {
    key: "doFlush",
    value: function doFlush() {}
  }, {
    key: "send",
    value: function send(msg) {
      try {
        this.logger.info(JSON.stringify(msg));
      } catch (e) {
        console.error(e);
      }
    }
  }, {
    key: "close",
    value: function close() {
      _log4js.default.shutdown(() => {});
    }
  }, {
    key: "constructFilePath",
    value: function constructFilePath() {
      return this.filePrefix;
    }
  }]);

  return LoggingConsumer;
}();

exports.default = LoggingConsumer;