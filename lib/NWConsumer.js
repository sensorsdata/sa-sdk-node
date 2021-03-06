"use strict";

require("core-js/modules/es.object.assign");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.promise");

require("core-js/modules/es.reflect.construct");

require("core-js/modules/es.reflect.get");

require("core-js/modules/es.regexp.to-string");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("regenerator-runtime/runtime");

var _ramda = _interopRequireDefault(require("ramda"));

var _rx = require("rx");

var _url = _interopRequireDefault(require("url"));

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _zlib = _interopRequireDefault(require("mz/zlib"));

var _formUrlencoded = _interopRequireDefault(require("form-urlencoded"));

var _debug = _interopRequireDefault(require("debug"));

var _TaskQueue = _interopRequireDefault(require("./TaskQueue"));

var _db = _interopRequireDefault(require("./db"));

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

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

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

var NWConsumer = /*#__PURE__*/function (_Subject) {
  _inherits(NWConsumer, _Subject);

  var _super = _createSuper(NWConsumer);

  _createClass(NWConsumer, null, [{
    key: "composeDebugUrl",
    value: function composeDebugUrl(url) {
      return _url.default.format(_ramda.default.merge(_url.default.parse(url), {
        pathname: "/debug"
      }));
    }
  }]);

  function NWConsumer(_ref) {
    var _thisSuper, _this;

    var url = _ref.url,
        cachePath = _ref.cachePath,
        _ref$gzip = _ref.gzip,
        gzip = _ref$gzip === void 0 ? true : _ref$gzip,
        _ref$mode = _ref.mode,
        mode = _ref$mode === void 0 ? "track" : _ref$mode,
        _ref$timeout = _ref.timeout,
        timeout = _ref$timeout === void 0 ? DEFAULT_TIMEOUT : _ref$timeout;

    _classCallCheck(this, NWConsumer);

    _this = _super.call(this);

    if (typeof arguments[0] === "string") {
      url = arguments[0];
    }

    if (url == null) {
      throw new Error("Url is not provided");
    }

    if (cachePath == null) {
      throw new Error("CachePath is not provided");
    }

    if (MODES[mode] == null) {
      throw new Error(`Unknown mode: ${mode}`);
    }

    Object.assign(_assertThisInitialized(_this), {
      url,
      cachePath,
      gzip,
      timeout
    }, MODES[mode]);

    if (_this.debug) {
      _this.url = NWConsumer.composeDebugUrl(url);
    }

    debug("Config: %o", _assertThisInitialized(_this));
    _this.db = new _db.default(cachePath);
    _this.dataQueue = new _TaskQueue.default({
      consumeData: _this.submit.bind(_assertThisInitialized(_this)),
      onSucceeded: function onSucceeded() {
        _get((_thisSuper = _assertThisInitialized(_this), _getPrototypeOf(NWConsumer.prototype)), "onNext", _thisSuper).call(_thisSuper, null);
      },
      onError: _this.onError.bind(_assertThisInitialized(_this))
    });

    _this.pushCache();

    return _this;
  }

  _createClass(NWConsumer, [{
    key: "catch",
    value: function _catch(callback) {
      debug("Error:");
      this.subscribe(_ramda.default.identity, callback, _ramda.default.identity);
    }
  }, {
    key: "onNext",
    value: function onNext(data) {
      debug("onNext(%o)", data);
      this.dataQueue.enqueueAndStart(data);
    }
  }, {
    key: "pushCache",
    value: function () {
      var _pushCache = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var _this2 = this;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.db.uploadCache(function (message) {
                  _this2.submit(message).catch(function (err) {
                    debug(err);
                  });
                });

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function pushCache() {
        return _pushCache.apply(this, arguments);
      }

      return pushCache;
    }()
  }, {
    key: "submit",
    value: function () {
      var _submit = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(data) {
        var _this3 = this;

        var message, messages, payloadText, dataListBuffer, body, headers;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!(data == null)) {
                  _context2.next = 3;
                  break;
                }

                debug("Skiped due to empty data");
                return _context2.abrupt("return");

              case 3:
                if (data._id && data.message) {
                  message = JSON.parse(data.message);
                } else {
                  message = data;
                }

                messages = Array.isArray(message) ? message : [message];

                if (!(messages.length === 0)) {
                  _context2.next = 8;
                  break;
                }

                debug("Skiped due to empty batch data");
                return _context2.abrupt("return");

              case 8:
                debug("submit(%j)", messages);
                payloadText = new Buffer(JSON.stringify(messages), "utf8");
                _context2.next = 12;
                return this.gzip ? _zlib.default.gzip(payloadText) : payloadText;

              case 12:
                dataListBuffer = _context2.sent;
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
                (0, _nodeFetch.default)(this.url, {
                  method: "POST",
                  headers,
                  body,
                  timeout: this.timeout
                }).then(function (response) {
                  debug("Post complete");

                  if (response.ok) {
                    debug("Suceeded: %d", response.status);

                    if (data._id && data.message) {
                      _this3.db.deleteEvent(data);
                    }

                    return;
                  }

                  debug("Error: %s", response.status);

                  if (!(data._id && data.message)) {
                    _this3.db.cacheLog(JSON.stringify(data));
                  }

                  if (_this3.debug && messages.count > 1 && response.status === 400) {
                    debug("Batch mode is not supported in debug");
                    throw new Error("Batch mode is not supported in Debug");
                  }

                  response.text().then(function (errorMessage) {
                    throw new Error(errorMessage);
                  });
                }).catch(function (err) {
                  if (!(data._id && data.message)) {
                    _this3.db.cacheLog(JSON.stringify(data));
                  }

                  debug(`timeout: ${err}`);
                });

              case 20:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function submit(_x) {
        return _submit.apply(this, arguments);
      }

      return submit;
    }()
  }]);

  return NWConsumer;
}(_rx.Subject);

var _default = NWConsumer;
exports.default = _default;