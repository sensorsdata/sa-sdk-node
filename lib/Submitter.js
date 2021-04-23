"use strict";

require("core-js/modules/es.reflect.get.js");

require("core-js/modules/es.reflect.construct.js");

require("core-js/modules/es.promise.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("regenerator-runtime/runtime.js");

require("core-js/modules/es.object.assign.js");

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.regexp.to-string.js");

var _ramda = _interopRequireDefault(require("ramda"));

var _rx = require("rx");

var _url = _interopRequireDefault(require("url"));

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _zlib = _interopRequireDefault(require("mz/zlib"));

var _formUrlencoded = _interopRequireDefault(require("form-urlencoded"));

var _debug = _interopRequireDefault(require("debug"));

var _TaskQueue = _interopRequireDefault(require("./TaskQueue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var debug = (0, _debug.default)("sa:Submitter");
var DEFAULT_TIMEOUT = 10000;
var MODES = {
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

var Submitter = /*#__PURE__*/function (_Subject) {
  _inherits(Submitter, _Subject);

  var _super = _createSuper(Submitter);

  function Submitter(_ref) {
    var _thisSuper, _this;

    var url = _ref.url,
        _ref$gzip = _ref.gzip,
        gzip = _ref$gzip === void 0 ? true : _ref$gzip,
        _ref$mode = _ref.mode,
        mode = _ref$mode === void 0 ? "track" : _ref$mode,
        _ref$timeout = _ref.timeout,
        timeout = _ref$timeout === void 0 ? DEFAULT_TIMEOUT : _ref$timeout;

    _classCallCheck(this, Submitter);

    _this = _super.call(this);

    if (typeof arguments[0] === "string") {
      url = arguments[0];
    }

    if (url == null) {
      throw new Error("Url is not provided");
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

    debug("Config: %o", _assertThisInitialized(_this));
    _this.dataQueue = new _TaskQueue.default({
      consumeData: _this.submit.bind(_assertThisInitialized(_this)),
      onSucceeded: function onSucceeded() {
        _get((_thisSuper = _assertThisInitialized(_this), _getPrototypeOf(Submitter.prototype)), "onNext", _thisSuper).call(_thisSuper, null);
      },
      onError: _this.onError.bind(_assertThisInitialized(_this))
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
      debug("onNext(%o)", data);

      if (data == null) {
        debug("Skiped due to empty data");
        return;
      }

      var messages = Array.isArray(data) ? data : [data];

      if (messages.length === 0) {
        debug("Skiped due to empty batch data");
        return;
      }

      this.dataQueue.enqueueAndStart(messages);
    }
  }, {
    key: "submit",
    value: function () {
      var _submit = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(messages) {
        var payloadText, dataListBuffer, body, headers, response, errorMessage;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                debug("submit(%j)", messages);
                payloadText = new Buffer(JSON.stringify(messages), "utf8");
                _context.next = 4;
                return this.gzip ? _zlib.default.gzip(payloadText) : payloadText;

              case 4:
                dataListBuffer = _context.sent;
                body = (0, _formUrlencoded.default)({
                  data_list: dataListBuffer.toString("base64"),
                  gzip: this.gzip ? 1 : 0
                });
                headers = {
                  "User-Agent": "SensorsAnalytics Node SDK",
                  "Content-Type": "application/x-www-form-urlencoded",
                  "Dry-Run": this.dryRun ? "true" : undefined
                };
                debug("Post to %s", this.url);
                debug("Headers: %o", headers);
                debug("Body: %o", body);
                debug("Posting...");
                _context.next = 13;
                return (0, _nodeFetch.default)(this.url, {
                  method: "POST",
                  headers,
                  body,
                  timeout: this.timeout
                });

              case 13:
                response = _context.sent;
                debug("Post complete");

                if (!response.ok) {
                  _context.next = 18;
                  break;
                }

                debug("Suceeded: %d", response.status);
                return _context.abrupt("return");

              case 18:
                debug("Error: %s", response.status);

                if (!(this.debug && messages.count > 1 && response.status === 400)) {
                  _context.next = 22;
                  break;
                }

                debug("Batch mode is not supported in debug");
                throw new Error("Batch mode is not supported in Debug");

              case 22:
                _context.next = 24;
                return response.text();

              case 24:
                errorMessage = _context.sent;
                throw new Error(errorMessage);

              case 26:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function submit(_x) {
        return _submit.apply(this, arguments);
      }

      return submit;
    }()
  }], [{
    key: "composeDebugUrl",
    value: function composeDebugUrl(url) {
      return _url.default.format(_ramda.default.merge(_url.default.parse(url), {
        pathname: "/debug"
      }));
    }
  }]);

  return Submitter;
}(_rx.Subject);

var _default = Submitter;
exports.default = _default;