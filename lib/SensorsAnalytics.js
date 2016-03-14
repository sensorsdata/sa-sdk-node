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

var _Submitter = require('./Submitter');

var _Submitter2 = _interopRequireDefault(_Submitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

const snakenizeKeys = (0, _translators.translateKeys)(_translators.pascal2Snake);

let SensorsAnalytics = function (_Subject) {
  _inherits(SensorsAnalytics, _Subject);

  function SensorsAnalytics() {
    _classCallCheck(this, SensorsAnalytics);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SensorsAnalytics).call(this));

    _this.clearSuperProperties();
    return _this;
  }

  _createClass(SensorsAnalytics, [{
    key: 'registerSuperProperties',
    value: function registerSuperProperties() {
      let values = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return Object.assign(this.superProperties, values);
    }
  }, {
    key: 'clearSuperProperties',
    value: function clearSuperProperties() {
      this.superProperties = {
        $lib: 'Node',
        $libVersion: _readPackageInfo.version
      };

      return this.superProperties;
    }
  }, {
    key: 'superizeProperties',
    value: function superizeProperties() {
      let properties = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return _ramda2.default.merge(this.superProperties, properties);
    }
  }, {
    key: 'track',
    value: function track(distinctId, event, eventProperties) {
      const properties = this.superizeProperties(eventProperties);

      this.internalTrack('track', { event, distinctId, properties });
    }
  }, {
    key: 'trackSignup',
    value: function trackSignup(distinctId, originalId, eventProperties) {
      const properties = this.superizeProperties(eventProperties);

      this.internalTrack('track_signup', { event: '$SignUp', distinctId, originalId, properties });
    }
  }, {
    key: 'profileSet',
    value: function profileSet(distinctId, properties) {
      this.internalTrack('profile_set', { distinctId, properties });
    }
  }, {
    key: 'profileSetOnce',
    value: function profileSetOnce(distinctId, properties) {
      this.internalTrack('profile_set_once', { distinctId, properties });
    }
  }, {
    key: 'profileIncrement',
    value: function profileIncrement(distinctId, properties) {
      this.internalTrack('profile_increment', { distinctId, properties });
    }
  }, {
    key: 'profileAppend',
    value: function profileAppend(distinctId, properties) {
      this.internalTrack('profile_append', { distinctId, properties });
    }
  }, {
    key: 'profileUnset',
    value: function profileUnset(distinctId) {
      let keys = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

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

      const time = (0, _translators.translateTimeStamp)(properties.$time);

      const envelope = snakenizeKeys({
        type,
        event,
        time,
        distinctId,
        originalId,
        properties: snakenizeKeys(properties)
      });

      this.onNext(envelope);
    }
  }, {
    key: 'submitTo',
    value: function submitTo(url, options) {
      const submitter = new _Submitter2.default(url, options);

      this.subscribe(submitter);

      return submitter;
    }
  }]);

  return SensorsAnalytics;
}(_rx.Subject);

exports.default = SensorsAnalytics;