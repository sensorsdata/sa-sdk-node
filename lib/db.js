"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lokijs = _interopRequireDefault(require("lokijs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

let db;
let events;

let DBCache =
/*#__PURE__*/
function () {
  function DBCache(cachePath) {
    _classCallCheck(this, DBCache);

    db = new _lokijs.default(cachePath + '/salog.db');

    this._databaseInitialize();
  }

  _createClass(DBCache, [{
    key: "_databaseInitialize",
    value: function _databaseInitialize() {
      if (events === null) {
        events = db.getCollection("events");
      }

      if (events === null) {
        events = db.addCollection("events");
      }
    }
  }, {
    key: "test",
    value: function test() {
      // db = new LokiConstructor(cachePath + '/salog.db');
      console.log(db);
      db.loadDatabase({}, function (err) {
        if (events === null) {
          events = db.getCollection("events");
        }

        if (events === null) {
          events = db.addCollection("events");
        }

        if (err) {
          console.log(err);
        } else {
          events = db.getCollection("events");
          events.find().forEach((v, i) => {
            console.log(v.message);
          });
        }
      });
    }
  }, {
    key: "cacheLog",
    value: function cacheLog(message) {
      // console.log(message);
      // db.loadDatabase({}, function() {
      var _collection = db.getCollection("events");

      if (!_collection) {
        // console.log("Collection %s does not exit. Creating ...", "events");
        _collection = db.addCollection('events');
      }

      _collection.insert({
        message: message
      });

      db.saveDatabase(); // });
    }
  }, {
    key: "selectAll",
    value: function selectAll() {
      this._databaseInitialize();

      return new Promise((resolve, reject) => {
        db.loadDatabase({}, function (err) {
          if (err) {
            reject(err);
          } else {
            var _collection = db.getCollection("events");

            if (!_collection) {
              // console.log("Collection %s does not exit. Creating ...", "events");
              _collection = db.addCollection('events');
            }

            resolve(_collection.find());
          }
        });
      });
    }
  }, {
    key: "deleteById",
    value: function deleteById(row) {
      var events = db.getCollection("events");
      events.remove(row);
      db.saveDatabase(function (err) {
        if (err) {
          console.log(err);
        }
      });
    }
  }, {
    key: "uploadCache",
    value: async function uploadCache(upload) {
      this.selectAll().then(rows => {
        rows.forEach((row, i) => {
          this.deleteById(row);
          const message = JSON.parse(row.message);

          if (message._track_id) {
            upload(message);
          }
        });
      }).catch(err => {
        console.log(err);
      });
    }
  }]);

  return DBCache;
}();

var _default = DBCache;
exports.default = _default;