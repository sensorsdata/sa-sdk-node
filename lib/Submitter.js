'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _rx = require('rx');

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _zlib = require('mz/zlib');

var _zlib2 = _interopRequireDefault(_zlib);

var _formUrlencoded = require('form-urlencoded');

var _formUrlencoded2 = _interopRequireDefault(_formUrlencoded);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _TaskQueue = require('./TaskQueue');

var _TaskQueue2 = _interopRequireDefault(_TaskQueue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

const debug = (0, _debug2.default)('sa:Submitter');

const DEFAULT_TIMEOUT = 10000;
const MODES = {
  track: { debug: false, dryRun: false },
  debug: { debug: true, dryRun: false },
  dryRun: { debug: true, dryRun: true },

  debug_off: { debug: false, dryRun: false },
  debug_and_track: { debug: true, dryRun: false },
  debug_only: { debug: true, dryRun: true }
};

let Submitter = function (_Subject) {
  _inherits(Submitter, _Subject);

  _createClass(Submitter, null, [{
    key: 'composeDebugUrl',
    value: function composeDebugUrl(url) {
      return _url2.default.format(_ramda2.default.merge(_url2.default.parse(url), { pathname: '/debug' }));
    }
  }]);

  function Submitter(_ref) {
    let url = _ref.url;
    var _ref$gzip = _ref.gzip;
    let gzip = _ref$gzip === undefined ? true : _ref$gzip;
    var _ref$mode = _ref.mode;
    let mode = _ref$mode === undefined ? 'track' : _ref$mode;
    var _ref$timeout = _ref.timeout;
    let timeout = _ref$timeout === undefined ? DEFAULT_TIMEOUT : _ref$timeout;

    _classCallCheck(this, Submitter);

    var _this = _possibleConstructorReturn(this, (Submitter.__proto__ || Object.getPrototypeOf(Submitter)).call(this));

    if (typeof arguments[0] === 'string') {
      // eslint-disable-line prefer-rest-params
      url = arguments[0]; // eslint-disable-line no-param-reassign, prefer-rest-params
    }

    if (url == null) {
      throw new Error('Url is not provided');
    }

    if (MODES[mode] == null) {
      throw new Error(`Unknown mode: ${ mode }`);
    }

    Object.assign(_this, { url, gzip, timeout }, MODES[mode]);

    if (_this.debug) {
      _this.url = Submitter.composeDebugUrl(url);
    }

    debug('Config: %o', _this);

    _this.dataQueue = new _TaskQueue2.default({
      consumeData: _this.submit.bind(_this),
      onSucceeded: () => {
        _get(Submitter.prototype.__proto__ || Object.getPrototypeOf(Submitter.prototype), 'onNext', _this).call(_this, null);
      },
      onError: _this.onError.bind(_this)
    });
    return _this;
  }

  _createClass(Submitter, [{
    key: 'catch',
    value: function _catch(callback) {
      this.subscribe(_ramda2.default.identity, callback, _ramda2.default.identity);
    }
  }, {
    key: 'onNext',
    value: function onNext(data) {
      debug('onNext(%o)', data);

      if (data == null) {
        debug('Skiped due to empty data');
        return;
      }

      const messages = Array.isArray(data) ? data : [data];

      if (messages.length === 0) {
        debug('Skiped due to empty batch data');
        return;
      }

      this.dataQueue.enqueueAndStart(messages);
    }
  }, {
    key: 'submit',
    value: (() => {
      var _ref2 = _asyncToGenerator(function* (messages) {
        debug('submit(%j)', messages);
        const payloadText = new Buffer(JSON.stringify(messages), 'utf8');
        const dataListBuffer = yield this.gzip ? _zlib2.default.gzip(payloadText) : payloadText;
        const body = (0, _formUrlencoded2.default)({
          data_list: dataListBuffer.toString('base64'),
          gzip: this.gzip ? 1 : 0
        });

        const headers = {
          'User-Agent': 'SensorsAnalytics Node SDK',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Dry-Run': this.dryRun ? 'true' : undefined
        };

        debug('Post to %s', this.url);
        debug('Headers: %o', headers);
        debug('Body: %o', body);

        debug('Posting...');
        const response = yield (0, _nodeFetch2.default)(this.url, { method: 'POST', headers, body, timeout: this.timeout });
        debug('Post complete');

        if (response.ok) {
          debug('Suceeded: %d', response.status);
          return;
        }

        debug('Error: %s', response.status);

        if (this.debug && messages.count > 1 && response.status === 400) {
          debug('Batch mode is not supported in debug');
          throw new Error('Batch mode is not supported in Debug');
        }

        const errorMessage = yield response.text();
        throw new Error(errorMessage);
      });

      function submit(_x) {
        return _ref2.apply(this, arguments);
      }

      return submit;
    })()
  }]);

  return Submitter;
}(_rx.Subject);

exports.default = Submitter;