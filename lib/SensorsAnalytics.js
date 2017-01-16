'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _rx = require('rx');

var _translators = require('./translators');

var _readPackageInfo = require('./readPackageInfo');

var _assertions = require('./assertions');

var _Submitter = require('./Submitter');

var _Submitter2 = _interopRequireDefault(_Submitter);

var _LoggingConsumer = require('./LoggingConsumer');

var _LoggingConsumer2 = _interopRequireDefault(_LoggingConsumer);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

const debug = (0, _debug2.default)('sa:SensorsAnalytics');

const SDK_PROPERTIES = {
  $lib: 'Node',
  $libVersion: _readPackageInfo.version
};

let SensorsAnalytics = function (_Subject) {
  _inherits(SensorsAnalytics, _Subject);

  function SensorsAnalytics() {
    _classCallCheck(this, SensorsAnalytics);

    var _this = _possibleConstructorReturn(this, (SensorsAnalytics.__proto__ || Object.getPrototypeOf(SensorsAnalytics)).call(this));

    _this.logger = null;
    _this.loggingConsumer = false;
    _this.enableReNameOption();
    _this.clearSuperProperties();
    return _this;
  }

  _createClass(SensorsAnalytics, [{
    key: 'disableLoggingConsumer',
    value: function disableLoggingConsumer() {
      this.loggingConsumer = false;
    }
  }, {
    key: 'enableLoggingConsumer',
    value: function enableLoggingConsumer() {
      this.loggingConsumer = true;
    }
  }, {
    key: 'registerSuperProperties',
    value: function registerSuperProperties() {
      let values = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      debug('registerSuperProperties(%j)', values);
      (0, _assertions.checkProperties)(values, _assertions.checkPattern);
      (0, _assertions.checkProperties)(values, _assertions.checkValueType);

      return Object.assign(this.superProperties, values);
    }
  }, {
    key: 'clearSuperProperties',
    value: function clearSuperProperties() {
      debug('clearSuperProperties()');

      this.superProperties = {};

      return this.superProperties;
    }
  }, {
    key: 'disableReNameOption',
    value: function disableReNameOption() {
      debug('resetReNameOption()');

      this.allowReNameOption = false;

      return this.allowReNameOption;
    }
  }, {
    key: 'enableReNameOption',
    value: function enableReNameOption() {
      debug('resetReNameOption()');

      this.allowReNameOption = true;

      return this.allowReNameOption;
    }
  }, {
    key: 'superizeProperties',
    value: function superizeProperties() {
      let properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      let callIndex = arguments[1];

      // 合并公共属性
      const codeProperties = (0, _translators.extractCodeProperties)(callIndex);
      return {
        properties: _ramda2.default.mergeAll([this.superProperties, (0, _translators.translateUserAgent)(properties)]),
        lib: (0, _translators.snakenizeKeys)(_ramda2.default.mergeAll([SDK_PROPERTIES, codeProperties, { '$app_version': this.superProperties.$app_version || this.superProperties.$appVersion || properties.$app_version || properties.$appVersion }]))
      };
    }
  }, {
    key: 'track',
    value: function track(distinctId, event, eventProperties) {
      debug('track(%j)', { distinctId, event, eventProperties });

      (0, _assertions.checkExists)(distinctId, 'distinctId');
      (0, _assertions.checkPattern)(event, 'event');
      (0, _assertions.checkProperties)(eventProperties, _assertions.checkValueType);

      const superize = this.superizeProperties(eventProperties, 4);

      this.internalTrack('track', { event, distinctId, properties: _ramda2.default.mergeAll([(0, _translators.snakenizeKeys)(SDK_PROPERTIES), superize.properties]), lib: superize.lib });
    }
  }, {
    key: 'trackSignup',
    value: function trackSignup(distinctId, originalId, eventProperties) {
      debug('trackSignup(%j)', { distinctId, originalId, eventProperties });

      (0, _assertions.checkExists)(distinctId, 'distinctId');
      (0, _assertions.checkExists)(originalId, 'originalId');
      (0, _assertions.checkProperties)(eventProperties, _assertions.checkValueType);

      const superize = this.superizeProperties(eventProperties, 4);

      this.internalTrack('track_signup', { event: '$SignUp', distinctId, originalId, properties: _ramda2.default.mergeAll([(0, _translators.snakenizeKeys)(SDK_PROPERTIES), superize.properties]), lib: superize.lib });
    }
  }, {
    key: 'profileSet',
    value: function profileSet(distinctId, properties) {
      debug('profileSet(%j)', { distinctId, properties });

      (0, _assertions.checkExists)(distinctId, 'distinctId');
      (0, _assertions.checkProperties)(properties, _assertions.checkValueType);

      const superize = this.superizeProperties(properties, 4);

      if (superize.properties.hasOwnProperty('$app_version')) {
        delete superize.properties.$app_version;
      }

      if (superize.properties.hasOwnProperty('$appVersion')) {
        delete superize.properties.$appVersion;
      }

      this.internalTrack('profile_set', { distinctId, properties: superize.properties, lib: superize.lib });
    }
  }, {
    key: 'profileSetOnce',
    value: function profileSetOnce(distinctId, properties) {
      debug('profileSetOnce(%j)', { distinctId, properties });

      (0, _assertions.checkExists)(distinctId, 'distinctId');
      (0, _assertions.checkProperties)(properties, _assertions.checkValueType);

      const superize = this.superizeProperties(properties, 4);

      if (superize.properties.hasOwnProperty('$app_version')) {
        delete superize.properties.$app_version;
      }

      if (superize.properties.hasOwnProperty('$appVersion')) {
        delete superize.properties.$appVersion;
      }

      this.internalTrack('profile_set_once', { distinctId, properties: superize.properties, lib: superize.lib });
    }
  }, {
    key: 'profileIncrement',
    value: function profileIncrement(distinctId, properties) {
      debug('profileIncrement(%j)', { distinctId, properties });

      (0, _assertions.checkExists)(distinctId, 'distinctId');
      (0, _assertions.checkProperties)(properties, _assertions.checkValueIsNumber);

      this.internalTrack('profile_increment', { distinctId, properties });
    }
  }, {
    key: 'profileAppend',
    value: function profileAppend(distinctId, properties) {
      debug('profileAppend(%j)', { distinctId, properties });

      (0, _assertions.checkExists)(distinctId, 'distinctId');
      (0, _assertions.checkProperties)(properties, _assertions.checkValueIsStringArray);

      this.internalTrack('profile_append', { distinctId, properties });
    }
  }, {
    key: 'profileUnset',
    value: function profileUnset(distinctId) {
      let keys = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      debug('profileUnset(%j)', { distinctId, keys });

      (0, _assertions.checkExists)(distinctId, 'distinctId');
      (0, _assertions.checkIsStringArray)(keys, 'Keys');

      const properties = _ramda2.default.zipObj(keys, _ramda2.default.repeat(true, keys.length));

      this.internalTrack('profile_unset', { distinctId, properties });
    }
  }, {
    key: 'internalTrack',
    value: function internalTrack(type, _ref) {
      let event = _ref.event;
      let distinctId = _ref.distinctId;
      let originalId = _ref.originalId;
      let properties = _ref.properties;
      let lib = _ref.lib;


      if (this.allowReNameOption) {
        properties = (0, _translators.snakenizeKeys)(properties);
        event = (0, _translators.pascal2Snake)(event);
      }
      const envelope = (0, _translators.snakenizeKeys)({
        type,
        event,
        time: (0, _translators.extractTimestamp)(properties),
        distinctId,
        originalId,
        properties: (0, _assertions.checkProperties)(properties, _assertions.checkPattern),
        lib
      });

      debug('envelope: %j', envelope);

      if (this.loggingConsumer) {
        this.logger.send(envelope);
      } else {
        this.onNext(envelope);
      }
    }
  }, {
    key: 'inBatch',
    value: function inBatch(_ref2) {
      let count = _ref2.count;
      let timeSpan = _ref2.timeSpan;

      const mode = `${ count != null ? 'count' : '' }${ timeSpan != null ? 'time' : '' }`;

      debug('inBatch(%j)', { count, timeSpan, mode });

      switch (mode) {
        case 'count':
          return this.bufferWithCount(count).filter(events => events.length > 0);
        case 'counttime':
          return this.bufferWithTimeOrCount(timeSpan, count).filter(events => events.length > 0);
        case 'time':
          return this.bufferWithTime(timeSpan).filter(events => events.length > 0);
        default:
          return this;
      }
    }
  }, {
    key: 'submitTo',
    value: function submitTo(options) {
      let batchOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      debug('submitTo(%j, %j)', options, batchOptions);

      const observable = this.inBatch(batchOptions);
      const submitter = new _Submitter2.default(options);

      observable.subscribe(submitter);

      return submitter;
    }
  }, {
    key: 'initLoggingConsumer',
    value: function initLoggingConsumer(path) {
      this.enableLoggingConsumer();
      this.logger = new _LoggingConsumer2.default(path);
    }
  }, {
    key: 'close',
    value: function close() {
      this.onCompleted();
      this.logger.close();
    }
  }]);

  return SensorsAnalytics;
}(_rx.Subject);

exports.default = SensorsAnalytics;