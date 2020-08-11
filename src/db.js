import "core-js";
import Nedb from "nedb";
import createDebug from "debug";
const debug = createDebug("sa:Submitter");

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
        debug(err);
      }
    });
  }

  selectAll() {
    return new Promise((resolve, reject) => {
      db.find({}, function (err, events) {
        if (err) {
          reject(err);
        } else {
          resolve(events);
        }
      });
    });
  }

  deleteEvent(event) {
    db.remove({ _id: event._id }, {}, function (err, numRemoved) {
      if (err) {
        reject(err);
      }
    });
  }

  async uploadCache(upload) {
    this.selectAll()
      .then((events) => {
        events.forEach((event) => {
          //   this.deleteById(event);
          upload(event);
          //   const message = JSON.parse(event.message);
          //   if (message._track_id) {
          //     upload(message);
          //   }
        });
      })
      .catch((err) => {
        debug(err);
      });
  }
}
export default DBCache;
