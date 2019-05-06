'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

const debug = (0, _debug2.default)('sa:TaskQueue');

const NOP = () => {};

let TaskQueue = function () {
  function TaskQueue() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    let consumeData = _ref.consumeData;
    var _ref$onSucceeded = _ref.onSucceeded;
    let onSucceeded = _ref$onSucceeded === undefined ? NOP : _ref$onSucceeded;
    var _ref$onError = _ref.onError;
    let onError = _ref$onError === undefined ? NOP : _ref$onError;

    _classCallCheck(this, TaskQueue);

    this.head = null;
    this.tail = null;

    this.consumeData = consumeData;
    this.onSucceeded = onSucceeded;
    this.onError = onError;

    this.executing = false;
  }

  _createClass(TaskQueue, [{
    key: 'enqueue',
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
    key: 'dequeue',
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
    key: 'executeTask',
    value: (() => {
      var _ref2 = _asyncToGenerator(function* () {
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
          const result = yield this.consumeData(data);
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
      });

      function executeTask() {
        return _ref2.apply(this, arguments);
      }

      return executeTask;
    })()
  }, {
    key: 'start',
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
    key: 'enqueueAndStart',
    value: function enqueueAndStart(data) {
      this.enqueue(data);
      return this.start();
    }
  }, {
    key: 'hasData',
    get: function get() {
      return this.head != null;
    }
  }]);

  return TaskQueue;
}();

exports.default = TaskQueue;