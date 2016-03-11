'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _rx = require('rx');

var _translators = require('./translators');

var _readPackageInfo = require('./readPackageInfo');

var _Submitter = require('./Submitter');

var _Submitter2 = _interopRequireDefault(_Submitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const snakenizeKeys = (0, _translators.translateKeys)(_translators.pascal2Snake);

let SensorsAnalytics = class SensorsAnalytics extends _rx.Subject {
  constructor() {
    this.clearSuperProperties();
  }

  registerSuperProperties() {
    let values = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return Object.assign(this.superProperties, values);
  }

  clearSuperProperties() {
    this.superProperties = {
      $lib: 'Node',
      $libVersion: _readPackageInfo.version
    };

    return this.superProperties;
  }

  superizeProperties() {
    let properties = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return _ramda2.default.merge(this.superProperties, properties);
  }

  track(distinctId, event, eventProperties) {
    const properties = this.superizeProperties(eventProperties);

    this.internalTrack('track', { event, distinctId, properties });
  }

  trackSignup(distinctId, originalId, eventProperties) {
    const properties = this.superizeProperties(eventProperties);

    this.internalTrack('track_signup', { event: '$SignUp', distinctId, originalId, properties });
  }

  profileSet(distinctId, properties) {
    this.internalTrack('profile_set', { distinctId, properties });
  }

  profileSetOnce(distinctId, properties) {
    this.internalTrack('profile_set_once', { distinctId, properties });
  }

  profileIncrement(distinctId, properties) {
    this.internalTrack('profile_increment', { distinctId, properties });
  }

  profileAppend(distinctId, properties) {
    this.internalTrack('profile_append', { distinctId, properties });
  }

  profileUnset(distinctId) {
    let keys = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

    const properties = _ramda2.default.zipObj(keys, _ramda2.default.repeat(true, keys.length));

    this.internalTrack('profile_unset', { distinctId, properties });
  }

  internalTrack(type, _ref) {
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

  submitTo(url, options) {
    const submitter = new _Submitter2.default(url, options);

    this.subscribe(submitter);

    return submitter;
  }
};
exports.default = SensorsAnalytics;