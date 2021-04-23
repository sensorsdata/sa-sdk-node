"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("regenerator-runtime/runtime.js");

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.promise.js");

var _nedb = _interopRequireDefault(require("nedb"));

var _debug = _interopRequireDefault(require("debug"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var debug = (0, _debug.default)("sa:Submitter");
var db;

var DBCache = /*#__PURE__*/function () {
  function DBCache(cachePath) {
    _classCallCheck(this, DBCache);

    db = new _nedb.default({
      filename: cachePath + "/salog.db",
      autoload: true
    });
  }

  _createClass(DBCache, [{
    key: "cacheLog",
    value: function cacheLog(message) {
      db.insert({
        message: message
      }, function (err, ret) {
        if (err) {
          debug(err);
        }
      });
    }
  }, {
    key: "selectAll",
    value: function selectAll() {
      return new Promise(function (resolve, reject) {
        db.find({}, function (err, events) {
          if (err) {
            reject(err);
          } else {
            resolve(events);
          }
        });
      });
    }
  }, {
    key: "deleteEvent",
    value: function deleteEvent(event) {
      db.remove({
        _id: event._id
      }, {}, function (err, numRemoved) {
        if (err) {
          reject(err);
        }
      });
    }
  }, {
    key: "uploadCache",
    value: function () {
      var _uploadCache = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(upload) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.selectAll().then(function (events) {
                  events.forEach(function (event) {
                    upload(event);
                  });
                }).catch(function (err) {
                  debug(err);
                });

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function uploadCache(_x) {
        return _uploadCache.apply(this, arguments);
      }

      return uploadCache;
    }()
  }]);

  return DBCache;
}();

var _default = DBCache;
exports.default = _default;