"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ramda = _interopRequireDefault(require("ramda"));

var _rx = require("rx");

var _url = _interopRequireDefault(require("url"));

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _zlib = _interopRequireDefault(require("mz/zlib"));

var _formUrlencoded = _interopRequireDefault(require("form-urlencoded"));

var _debug = _interopRequireDefault(require("debug"));

var _TaskQueue = _interopRequireDefault(require("./TaskQueue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

const debug = (0, _debug.default)('sa:Submitter');
const DEFAULT_TIMEOUT = 10000;
const MODES = {
  track: {
    debug: false,
    dryRun: false
  },
  debug: {
    debug: true,
    dryRun: false
  },
  dryRun: {
    debug: true,
    dryRun: true
  },
  debug_off: {
    debug: false,
    dryRun: false
  },
  debug_and_track: {
    debug: true,
    dryRun: false
  },
  debug_only: {
    debug: true,
    dryRun: true
  }
};

let Submitter =
/*#__PURE__*/
function (_Subject) {
  _inherits(Submitter, _Subject);

  _createClass(Submitter, null, [{
    key: "composeDebugUrl",
    value: function composeDebugUrl(url) {
      return _url.default.format(_ramda.default.merge(_url.default.parse(url), {
        pathname: '/debug'
      }));
    }
  }]);

  function Submitter(_ref) {
    var _context;

    var _this;

    let url = _ref.url,
        _ref$gzip = _ref.gzip,
        gzip = _ref$gzip === void 0 ? true : _ref$gzip,
        _ref$mode = _ref.mode,
        mode = _ref$mode === void 0 ? 'track' : _ref$mode,
        _ref$timeout = _ref.timeout,
        timeout = _ref$timeout === void 0 ? DEFAULT_TIMEOUT : _ref$timeout;

    _classCallCheck(this, Submitter);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Submitter).call(this));

    if (typeof arguments[0] === 'string') {
      // eslint-disable-line prefer-rest-params
      url = arguments[0]; // eslint-disable-line no-param-reassign, prefer-rest-params
    }

    if (url == null) {
      throw new Error('Url is not provided');
    }

    if (MODES[mode] == null) {
      throw new Error(`Unknown mode: ${mode}`);
    }

    Object.assign(_assertThisInitialized(_this), {
      url,
      gzip,
      timeout
    }, MODES[mode]);

    if (_this.debug) {
      _this.url = Submitter.composeDebugUrl(url);
    }

    debug('Config: %o', _assertThisInitialized(_this));
    _this.dataQueue = new _TaskQueue.default({
      consumeData: (_context = _this).submit.bind(_context),
      onSucceeded: () => {
        _get(_getPrototypeOf(Submitter.prototype), "onNext", _assertThisInitialized(_this)).call(_assertThisInitialized(_this), null);
      },
      onError: (_context = _this).onError.bind(_context)
    });
    return _this;
  }

  _createClass(Submitter, [{
    key: "catch",
    value: function _catch(callback) {
      this.subscribe(_ramda.default.identity, callback, _ramda.default.identity);
    }
  }, {
    key: "onNext",
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
    key: "submit",
    value: async function submit(messages) {
      debug('submit(%j)', messages);
      const payloadText = new Buffer(JSON.stringify(messages), 'utf8');
      const dataListBuffer = await (this.gzip ? _zlib.default.gzip(payloadText) : payloadText);
      const body = (0, _formUrlencoded.default)({
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
      const response = await (0, _nodeFetch.default)(this.url, {
        method: 'POST',
        headers,
        body,
        timeout: this.timeout
      });
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

      const errorMessage = await response.text();
      throw new Error(errorMessage);
    }
  }]);

  return Submitter;
}(_rx.Subject);

var _default = Submitter;
exports.default = _default;