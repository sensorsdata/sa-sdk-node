'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by m1911 on 17/1/12.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _log4js = require('log4js');

var _log4js2 = _interopRequireDefault(_log4js);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _nodeSerialize = require('node-serialize');

var _nodeSerialize2 = _interopRequireDefault(_nodeSerialize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

let LoggingConsumer = function () {
  function LoggingConsumer(filePath) {
    _classCallCheck(this, LoggingConsumer);

    this.currentFileName = null;
    this.logger = null;
    this.logName = "SensorsData.Analytics.LoggingConsumer";
    this.filePrefix = "/service.log.";
    this.initLoggingConsumer(filePath);
  }

  _createClass(LoggingConsumer, [{
    key: 'initLoggingConsumer',
    value: function initLoggingConsumer(filePath) {
      var reg = new RegExp('/^\/([/w]+\/?)+$/i');
      // if (!reg.exec(filePath)) {
      //   throw new Error('file path error')
      // }
      var fileName = this.constructFilePath();
      _log4js2.default.configure({
        "appenders": [{
          "type": "dateFile",
          "filename": filePath + this.filePrefix,
          "pattern": "yyyyMMdd",
          alwaysIncludePattern: true,
          "category": this.logName,
          layout: {
            type: 'pattern',
            pattern: '%m'
          }
        }]
      });
      this.logger = _log4js2.default.getLogger(this.logName);
    }
  }, {
    key: 'doFlush',
    value: function doFlush() {}
  }, {
    key: 'send',
    value: function send(msg) {
      try {
        this.logger.info(_nodeSerialize2.default.serialize(msg));
      } catch (e) {
        console.error(e);
        return;
      }
    }
  }, {
    key: 'close',
    value: function close() {
      _log4js2.default.shutdown(function () {});
    }
  }, {
    key: 'constructFilePath',
    value: function constructFilePath() {
      return this.filePrefix;
    }
  }]);

  return LoggingConsumer;
}();

exports.default = LoggingConsumer;