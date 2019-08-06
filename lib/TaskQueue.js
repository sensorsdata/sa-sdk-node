"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _debug = _interopRequireDefault(require("debug"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

const debug = (0, _debug.default)('sa:TaskQueue');

const NOP = () => {};

let TaskQueue =
/*#__PURE__*/
function () {
  function TaskQueue() {
    let _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
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
    key: "enqueue",
    value: function enqueue(data) {
      debug('Eneque: %o', data);
      const node = {
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
      debug('Dequeue');
      const result = this.head;

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
    value: async function executeTask() {
      debug('Execute Task...');

      if (!this.hasData) {
        this.executing = false;
        debug('Queue is empty, stop...');
        return null;
      }

      this.executing = true;
      const data = this.dequeue();

      try {
        debug('Consume data: %o', data);
        const result = await this.consumeData(data);
        debug('Succeeded');

        if (this.onSucceeded != null) {
          this.onSucceeded(result);
        }
      } catch (ex) {
        debug('Failed: %s', ex);

        if (this.onError != null) {
          this.onError(ex);
        }
      }

      return this.executeTask(); // No await to flattern cascaded promises
    }
  }, {
    key: "start",
    value: function start() {
      debug('Start task...');

      if (this.consumeData == null) {
        debug('consumeData is not given');
        throw new Error('consumeData is not given');
      }

      if (this.executing) {
        debug('Already running');
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
  }, {
    key: "hasData",
    get: function get() {
      return this.head != null;
    }
  }]);

  return TaskQueue;
}();

var _default = TaskQueue;
exports.default = _default;