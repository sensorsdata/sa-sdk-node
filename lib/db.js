"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _sqlite = require("sqlite3");

var _ = _interopRequireWildcard(require("lodash"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

let DBCache =
/*#__PURE__*/
function () {
  function DBCache(cachePath) {
    _classCallCheck(this, DBCache);

    console.log(cachePath + '/salog.db');
    this.db = new _sqlite.Database(cachePath + '/salog.db', err => {
      if (err) {
        console.log(err);
      }

      this.db.run(`CREATE TABLE IF NOT EXISTS salog(id INTEGER PRIMARY KEY AUTOINCREMENT,log TEXT)`, err => {
        if (err) {
          console.log(err);
        }
      });
    });
  }

  _createClass(DBCache, [{
    key: "cacheLog",
    value: function cacheLog(message) {
      this.db.run('INSERT INTO salog(log) VALUES(?)', [message], function (err) {
        if (err) {
          return console.log('insert data error: ', err.message);
        }
      });
    }
  }, {
    key: "selectAll",
    value: function selectAll() {
      return new Promise((resolve, reject) => {
        this.db.all('SELECT * FROM salog', [], function (err, rows) {
          if (err) {
            reject(err);
          }

          resolve(rows);
        });
      });
    }
  }, {
    key: "deleteById",
    value: function deleteById(id) {
      this.db.run(`DELETE FROM salog WHERE id = ?`, [id], err => {
        if (err) {
          console.log(err);
        }
      });
    }
  }, {
    key: "uploadCache",
    value: function uploadCache(upload) {
      this.selectAll().then(rows => {
        _.forEach(rows, (id, log) => {
          const message = JSON.parse(id.log);

          if (message._track_id) {
            // console.log(message._track_id)
            upload(message);
          }

          this.deleteById(id.id);
        });
      });
    }
  }]);

  return DBCache;
}();

var _default = DBCache;
exports.default = _default;