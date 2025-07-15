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

  deleteEvent(event) {
    db.remove({ _id: event._id }, {}, function (err, numRemoved) {
      if (err) {
        debug(err);
      }
    });
  }

  // 每间隔 2s 取 top 50 条缓存数据尝试进行发送
  async uploadCache(upload) {
    let interval = 2 * 1000;
    let unit = 50;

    let timer = setTimeout(function fetchAndUpload() {
      db.find({}).limit(unit).exec(async function (err, events) {
        if (!events || !events.length) {
          //消费完成
          debug('All cached data were sent complete.')
          return;
        }

        let sendTasks = [];
        events.forEach((event) => {
          sendTasks.push(upload(event));
        });

        try {
          await Promise.all(sendTasks);
        } catch (e) {
          debug(e)
        }
        finally {
          timer = setTimeout(fetchAndUpload, interval);
        }
      });

    }, interval);
  }
}
export default DBCache;
