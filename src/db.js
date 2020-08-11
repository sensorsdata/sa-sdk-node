import "core-js";
import Nedb from "nedb";

let db;

class DBCache {
  constructor(cachePath) {
    db = new Nedb({
      filename: cachePath + "/salog.db",
      autoload: true,
    });
  }

  cacheLog(message) {
    db.insert({ message: message }, (err, ret) => {
      if (err) {
        console.log(err);
      }
    });
  }

  selectAll() {
    return new Promise((resolve, reject) => {
      db.find({}, function (err, events) {
        // console.log(events);
        if (err) {
          reject(err);
        } else {
          resolve(events);
        }
      });
    });
  }

  deleteById(event) {
    db.remove({ _id: event._id }, {}, function (err, numRemoved) {
      if (err) {
        reject(err);
      }
    });
  }

  async uploadCache(upload) {
    this.selectAll()
      .then((rows) => {
        rows.forEach((row, i) => {
          this.deleteById(row);
          const message = JSON.parse(row.message);
          if (message._track_id) {
            upload(message);
          }
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
export default DBCache;
