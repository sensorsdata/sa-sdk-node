'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

const debug = (0, _debug2.default)('sa:Submitter');

const DEFAULT_TIMEOUT = 10000;
const MODES = {
  track: { debug: false, dryRun: false },
  debug: { debug: true, dryRun: false },
  dryRun: { debug: true, dryRun: true }
};

let Submitter = class Submitter extends _rx.Subject {
  constructor(url) {
    var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var _ref$gzip = _ref.gzip;
    let gzip = _ref$gzip === undefined ? true : _ref$gzip;
    var _ref$mode = _ref.mode;
    let mode = _ref$mode === undefined ? 'track' : _ref$mode;
    var _ref$timeout = _ref.timeout;
    let timeout = _ref$timeout === undefined ? DEFAULT_TIMEOUT : _ref$timeout;

    Object.assign(this, { url, gzip, timeout }, MODES[mode]);

    debug('Config: %o', this);
  }

  catch(callback) {
    this.subscribe(_ramda2.default.identity, callback, _ramda2.default.identity);
  }

  onNext(data) {
    var _this = this;

    return _asyncToGenerator(function* () {
      debug('onNext(%o)', data);

      const messages = Array.isArray(data) ? data : [data];

      try {
        yield _this.submit(messages);
      } catch (ex) {
        debug('Error: %o', ex);
        _this.onError(ex);
      }
    })();
  }

  submit(messages) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const payloadText = new Buffer(JSON.stringify(messages), 'utf8');
      const dataListBuffer = yield _this2.gzip ? _zlib2.default.gzip(payloadText) : payloadText;
      const body = (0, _formUrlencoded2.default)({
        data_list: dataListBuffer.toString('base64'),
        gzip: _this2.gzip ? 1 : 0
      });

      const headers = {
        'User-Agent': 'SensorsAnalytics Node SDK',
        'Dry-Run': _this2.dryRun ? 'true' : undefined
      };

      const actualUrl = _this2.debug ? _url2.default.resolve(_this2.url, '/debug') : _this2.url;

      debug('Post to %s', actualUrl);
      debug('Headers: %o', headers);
      debug('Body: %o', body);

      const response = yield (0, _nodeFetch2.default)(actualUrl, { method: 'POST', headers, body, timeout: _this2.timeout });

      if (response.ok) {
        debug('Suceeded');
        return;
      }

      debug('Error: %s', response.status);

      const errorMessage = yield response.text();
      throw new Error(errorMessage);
    })();
  }
};
exports.default = Submitter;