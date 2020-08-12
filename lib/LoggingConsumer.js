"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _winston = require("winston");

require("winston-daily-rotate-file");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var LoggingConsumer = /*#__PURE__*/function () {
  function LoggingConsumer(filePath, pm2Mode) {
    _classCallCheck(this, LoggingConsumer);

    this.currentFileName = null;
    this.logger = null;
    this.logName = "SensorsData.Analytics.LoggingConsumer";
    this.filePrefix = "/service.log.";
    this.initLoggingConsumer(filePath, pm2Mode);
  } // eslint-disable-next-line no-unused-vars


  _createClass(LoggingConsumer, [{
    key: "initLoggingConsumer",
    value: function initLoggingConsumer(filePath, pm2Mode) {
      this.initLoggingConsumer(filePath);
    } // eslint-disable-next-line no-dupe-class-members

  }, {
    key: "initLoggingConsumer",
    value: function initLoggingConsumer(filePath) {
      var myFormat = _winston.format.printf(function (_ref) {
        var message = _ref.message;
        return message;
      });

      var saLogConfiguration = {
        transports: [new _winston.transports.DailyRotateFile({
          filename: `${filePath + this.filePrefix}%DATE%`,
          datePattern: "YYYYMMDD",
          format: myFormat,
          level: "info",
          zippedArchive: false
        })]
      };
      this.logger = (0, _winston.createLogger)(saLogConfiguration);
    } // eslint-disable-next-line class-methods-use-this

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
      this.logger.close();
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