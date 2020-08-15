"use strict";

require("core-js/modules/es.array.filter");

require("core-js/modules/es.object.assign");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.reflect.construct");

require("core-js/modules/es.regexp.to-string");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ramda = _interopRequireDefault(require("ramda"));

var _rx = require("rx");

var _debug = _interopRequireDefault(require("debug"));

var _translators = require("./translators");

var _readPackageInfo = require("./readPackageInfo");

var _assertions = require("./assertions");

var _Submitter = _interopRequireDefault(require("./Submitter"));

var _LoggingConsumer = _interopRequireDefault(require("./LoggingConsumer"));

var _NWConsumer = _interopRequireDefault(require("./NWConsumer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var debug = (0, _debug.default)("sa:SensorsAnalytics");
var SDK_PROPERTIES = {
  $lib: "Node",
  $libVersion: _readPackageInfo.version
};

var SensorsAnalytics = /*#__PURE__*/function (_Subject) {
  _inherits(SensorsAnalytics, _Subject);

  var _super = _createSuper(SensorsAnalytics);

  function SensorsAnalytics() {
    var _this;

    _classCallCheck(this, SensorsAnalytics);

    _this = _super.call(this);
    _this.logger = null;
    _this.loggingConsumer = false;

    _this.enableReNameOption();

    _this.clearSuperProperties();

    return _this;
  }

  _createClass(SensorsAnalytics, [{
    key: "disableLoggingConsumer",
    value: function disableLoggingConsumer() {
      this.loggingConsumer = false;
    }
  }, {
    key: "enableLoggingConsumer",
    value: function enableLoggingConsumer() {
      this.loggingConsumer = true;
    }
  }, {
    key: "registerSuperProperties",
    value: function registerSuperProperties() {
      var values = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      debug("registerSuperProperties(%j)", values);
      (0, _assertions.checkProperties)(values, _assertions.checkPattern);
      (0, _assertions.checkProperties)(values, _assertions.checkValueType);
      return Object.assign(this.superProperties, values);
    }
  }, {
    key: "clearSuperProperties",
    value: function clearSuperProperties() {
      debug("clearSuperProperties()");
      this.superProperties = {};
      return this.superProperties;
    }
  }, {
    key: "disableReNameOption",
    value: function disableReNameOption() {
      debug("resetReNameOption()");
      this.allowReNameOption = false;
      return this.allowReNameOption;
    }
  }, {
    key: "enableReNameOption",
    value: function enableReNameOption() {
      debug("resetReNameOption()");
      this.allowReNameOption = true;
      return this.allowReNameOption;
    }
  }, {
    key: "superizeProperties",
    value: function superizeProperties() {
      var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var callIndex = arguments.length > 1 ? arguments[1] : undefined;
      // 合并公共属性
      var codeProperties = (0, _translators.extractCodeProperties)(callIndex);
      return {
        properties: _ramda.default.mergeAll([this.superProperties, (0, _translators.translateUserAgent)(properties)]),
        lib: (0, _translators.snakenizeKeys)(_ramda.default.mergeAll([SDK_PROPERTIES, codeProperties, {
          $app_version: this.superProperties.$app_version || this.superProperties.$appVersion || properties.$app_version || properties.$appVersion
        }]))
      };
    }
  }, {
    key: "track",
    value: function track(distinctId, event, eventProperties) {
      debug("track(%j)", {
        distinctId,
        event,
        eventProperties
      });
      (0, _assertions.checkExists)(distinctId, "distinctId");
      (0, _assertions.checkPattern)(event, "event");
      (0, _assertions.checkProperties)(eventProperties, _assertions.checkValueType);
      var superize = this.superizeProperties(eventProperties, 4);
      this.internalTrack("track", {
        event,
        distinctId,
        properties: _ramda.default.mergeAll([(0, _translators.snakenizeKeys)(SDK_PROPERTIES), superize.properties]),
        lib: superize.lib
      });
    }
  }, {
    key: "trackSignup",
    value: function trackSignup(distinctId, originalId, eventProperties) {
      debug("trackSignup(%j)", {
        distinctId,
        originalId,
        eventProperties
      });
      (0, _assertions.checkExists)(distinctId, "distinctId");
      (0, _assertions.checkExists)(originalId, "originalId");
      (0, _assertions.checkProperties)(eventProperties, _assertions.checkValueType);
      var superize = this.superizeProperties(eventProperties, 4);
      this.internalTrack("track_signup", {
        event: "$SignUp",
        distinctId,
        originalId,
        properties: _ramda.default.mergeAll([(0, _translators.snakenizeKeys)(SDK_PROPERTIES), superize.properties]),
        lib: superize.lib
      });
    }
  }, {
    key: "profileSet",
    value: function profileSet(distinctId, properties) {
      debug("profileSet(%j)", {
        distinctId,
        properties
      });
      (0, _assertions.checkExists)(distinctId, "distinctId");
      (0, _assertions.checkProperties)(properties, _assertions.checkValueType);
      var superize = this.superizeProperties(properties, 4);

      if (Object.prototype.hasOwnProperty.call(superize.properties, "$app_version")) {
        delete superize.properties.$app_version;
      }

      if (Object.prototype.hasOwnProperty.call(superize.properties, "$appVersion")) {
        delete superize.properties.$appVersion;
      }

      this.internalTrack("profile_set", {
        distinctId,
        properties: superize.properties,
        lib: superize.lib
      });
    }
  }, {
    key: "profileSetOnce",
    value: function profileSetOnce(distinctId, properties) {
      debug("profileSetOnce(%j)", {
        distinctId,
        properties
      });
      (0, _assertions.checkExists)(distinctId, "distinctId");
      (0, _assertions.checkProperties)(properties, _assertions.checkValueType);
      var superize = this.superizeProperties(properties, 4);

      if (Object.prototype.hasOwnProperty.call(superize.properties, "$app_version")) {
        delete superize.properties.$app_version;
      }

      if (Object.prototype.hasOwnProperty.call(superize.properties, "$appVersion")) {
        delete superize.properties.$appVersion;
      }

      this.internalTrack("profile_set_once", {
        distinctId,
        properties: superize.properties,
        lib: superize.lib
      });
    }
  }, {
    key: "profileIncrement",
    value: function profileIncrement(distinctId, properties) {
      debug("profileIncrement(%j)", {
        distinctId,
        properties
      });
      (0, _assertions.checkExists)(distinctId, "distinctId");
      (0, _assertions.checkProperties)(properties, _assertions.checkValueIsNumber);
      var superize = this.superizeProperties(properties, 4);

      if (Object.prototype.hasOwnProperty.call(superize.properties, "$app_version")) {
        delete superize.properties.$app_version;
      }

      if (Object.prototype.hasOwnProperty.call(superize.properties, "$appVersion")) {
        delete superize.properties.$appVersion;
      }

      this.internalTrack("profile_increment", {
        distinctId,
        properties,
        lib: superize.lib
      });
    }
  }, {
    key: "profileAppend",
    value: function profileAppend(distinctId, properties) {
      debug("profileAppend(%j)", {
        distinctId,
        properties
      });
      (0, _assertions.checkExists)(distinctId, "distinctId");
      (0, _assertions.checkProperties)(properties, _assertions.checkValueIsStringArray);
      var superize = this.superizeProperties(properties, 4);

      if (Object.prototype.hasOwnProperty.call(superize.properties, "$app_version")) {
        delete superize.properties.$app_version;
      }

      if (Object.prototype.hasOwnProperty.call(superize.properties, "$appVersion")) {
        delete superize.properties.$appVersion;
      }

      this.internalTrack("profile_append", {
        distinctId,
        properties,
        lib: superize.lib
      });
    }
  }, {
    key: "profileUnset",
    value: function profileUnset(distinctId) {
      var keys = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      debug("profileUnset(%j)", {
        distinctId,
        keys
      });
      (0, _assertions.checkExists)(distinctId, "distinctId");
      (0, _assertions.checkIsStringArray)(keys, "Keys");

      var properties = _ramda.default.zipObj(keys, _ramda.default.repeat(true, keys.length));

      var superize = this.superizeProperties(properties, 4);

      if (Object.prototype.hasOwnProperty.call(superize.properties, "$app_version")) {
        delete superize.properties.$app_version;
      }

      if (Object.prototype.hasOwnProperty.call(superize.properties, "$appVersion")) {
        delete superize.properties.$appVersion;
      }

      this.internalTrack("profile_unset", {
        distinctId,
        properties,
        lib: superize.lib
      });
    }
  }, {
    key: "itemSet",
    value: function itemSet(itemType, itemId, properties) {
      debug("itemSet(%j)", {
        itemType,
        itemId,
        properties
      });
      (0, _assertions.checkPattern)(itemType, "itemType");
      (0, _assertions.checkExists)(itemId, "itemId");
      (0, _assertions.checkProperties)(properties, _assertions.checkValueType);
      var superize = this.superizeProperties(properties, 4);
      this.internalTrack("item_set", {
        itemType,
        itemId,
        properties,
        lib: superize.lib
      });
    }
  }, {
    key: "itemDelete",
    value: function itemDelete(itemType, itemId) {
      debug("itemDelete(%j)", {
        itemType,
        itemId
      });
      (0, _assertions.checkPattern)(itemType, "itemType");
      (0, _assertions.checkExists)(itemId, "itemId");
      var superize = this.superizeProperties({}, 4);
      this.internalTrack("item_delete", {
        itemType,
        itemId,
        properties: {},
        lib: superize.lib
      });
    }
  }, {
    key: "internalTrack",
    value: function internalTrack(type, _ref) {
      var event = _ref.event,
          distinctId = _ref.distinctId,
          originalId = _ref.originalId,
          itemType = _ref.itemType,
          itemId = _ref.itemId,
          properties = _ref.properties,
          lib = _ref.lib;

      if (this.allowReNameOption) {
        properties = (0, _translators.snakenizeKeys)(properties);
        event = (0, _translators.pascal2Snake)(event);
      }

      var envelope = (0, _translators.snakenizeKeys)({
        _track_id: parseInt(Math.random() * (9999999999 - 999999999 + 1) + 999999999, 10),
        type,
        event,
        time: (0, _translators.extractTimestamp)(properties),
        distinctId,
        originalId,
        itemType,
        itemId,
        properties: (0, _assertions.checkProperties)(properties, _assertions.checkPattern),
        lib
      });
      debug("envelope: %j", envelope);

      if (this.loggingConsumer) {
        this.logger.send(envelope);
      } else {
        this.onNext(envelope);
      }
    }
  }, {
    key: "inBatch",
    value: function inBatch(_ref2) {
      var count = _ref2.count,
          timeSpan = _ref2.timeSpan;
      var mode = `${count != null ? "count" : ""}${timeSpan != null ? "time" : ""}`;
      debug("inBatch(%j)", {
        count,
        timeSpan,
        mode
      });

      switch (mode) {
        case "count":
          return this.bufferWithCount(count).filter(function (events) {
            return events.length > 0;
          });

        case "counttime":
          return this.bufferWithTimeOrCount(timeSpan, count).filter(function (events) {
            return events.length > 0;
          });

        case "time":
          return this.bufferWithTime(timeSpan).filter(function (events) {
            return events.length > 0;
          });

        default:
          return this;
      }
    }
  }, {
    key: "submitTo",
    value: function submitTo(options) {
      var batchOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      debug("submitTo(%j, %j)", options, batchOptions);
      var observable = this.inBatch(batchOptions);
      var submitter = new _Submitter.default(options);
      observable.subscribe(submitter);
      return submitter;
    }
  }, {
    key: "initNWConsumer",
    value: function initNWConsumer(options) {
      var batchOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      debug("initNWConsumer(%j, %j)", options, batchOptions);
      var observable = this.inBatch(batchOptions);
      var submitter = new _NWConsumer.default(options);
      observable.subscribe(submitter);
      return submitter;
    }
  }, {
    key: "initLoggingConsumer",
    value: function initLoggingConsumer(path, pm2Mode) {
      this.enableLoggingConsumer();
      this.logger = new _LoggingConsumer.default(path, pm2Mode);
    }
  }, {
    key: "close",
    value: function close() {
      this.onCompleted();
      this.logger.close();
    }
  }]);

  return SensorsAnalytics;
}(_rx.Subject);

var _default = SensorsAnalytics;
exports.default = _default;