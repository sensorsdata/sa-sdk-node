"use strict";

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.promise.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("regenerator-runtime/runtime.js");

var _debug = _interopRequireDefault(require("debug"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var debug = (0, _debug.default)("sa:TaskQueue");

var NOP = function NOP() {};

var TaskQueue = /*#__PURE__*/function () {
  function TaskQueue() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        consumeData = _ref.consumeData,
        _ref$onSucceeded = _ref.onSucceeded,
        onSucceeded = _ref$onSucceeded === void 0 ? NOP : _ref$onSucceeded,
        _ref$onError = _ref.onError,
        onError = _ref$onError === void 0 ? NOP : _ref$onError;

    _classCallCheck(this, TaskQueue);

    this.head = null;
    this.tail = null;
    this.consumeData = consumeData;
    this.onSucceeded = onSucceeded;
    this.onError = onError;
    this.executing = false;
  }

  _createClass(TaskQueue, [{
    key: "hasData",
    get: function get() {
      return this.head != null;
    }
  }, {
    key: "enqueue",
    value: function enqueue(data) {
      debug("Eneque: %o", data);
      var node = {
        data,
        next: null
      };

      if (this.tail == null) {
        this.tail = node;
        this.head = node;
      } else {
        this.tail.next = node;
        this.tail = node;
      }
    }
  }, {
    key: "dequeue",
    value: function dequeue() {
      debug("Dequeue");
      var result = this.head;

      if (result == null) {
        return null;
      }

      this.head = result.next;

      if (this.head == null) {
        this.tail = null;
      }

      return result.data;
    }
  }, {
    key: "executeTask",
    value: function () {
      var _executeTask = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var data, result;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                debug("Execute Task...");

                if (this.hasData) {
                  _context.next = 5;
                  break;
                }

                this.executing = false;
                debug("Queue is empty, stop...");
                return _context.abrupt("return", null);

              case 5:
                this.executing = true;
                data = this.dequeue();
                _context.prev = 7;
                debug("Consume data: %o", data);
                _context.next = 11;
                return this.consumeData(data);

              case 11:
                result = _context.sent;
                debug("Succeeded");

                if (this.onSucceeded != null) {
                  this.onSucceeded(result);
                }

                _context.next = 20;
                break;

              case 16:
                _context.prev = 16;
                _context.t0 = _context["catch"](7);
                debug("Failed: %s", _context.t0);

                if (this.onError != null) {
                  this.onError(_context.t0);
                }

              case 20:
                return _context.abrupt("return", this.executeTask());

              case 21:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[7, 16]]);
      }));

      function executeTask() {
        return _executeTask.apply(this, arguments);
      }

      return executeTask;
    }()
  }, {
    key: "start",
    value: function start() {
      debug("Start task...");

      if (this.consumeData == null) {
        debug("consumeData is not given");
        throw new Error("consumeData is not given");
      }

      if (this.executing) {
        debug("Already running");
        return null;
      }

      return this.executeTask();
    }
  }, {
    key: "enqueueAndStart",
    value: function enqueueAndStart(data) {
      this.enqueue(data);
      return this.start();
    }
  }]);

  return TaskQueue;
}();

var _default = TaskQueue;
exports.default = _default;