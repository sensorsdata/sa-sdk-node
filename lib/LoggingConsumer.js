"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/es.symbol.to-primitive.js");
require("core-js/modules/es.date.to-primitive.js");
require("core-js/modules/es.symbol.js");
require("core-js/modules/es.symbol.description.js");
require("core-js/modules/es.object.to-string.js");
var _winston = require("winston");
require("winston-daily-rotate-file");
var _debug = _interopRequireDefault(require("debug"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var debug = (0, _debug.default)("sa:Submitter");
var LoggingConsumer = /*#__PURE__*/function () {
  function LoggingConsumer(filePath, pm2Mode) {
    _classCallCheck(this, LoggingConsumer);
    this.currentFileName = null;
    this.logger = null;
    this.logName = "SensorsData.Analytics.LoggingConsumer";
    this.filePrefix = "/service.log.";
    this.initLoggingConsumer(filePath, pm2Mode);
  }
  _createClass(LoggingConsumer, [{
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
        debug(e);
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