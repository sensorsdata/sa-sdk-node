import LokiConstructor from 'lokijs'



let db;
let events

class DBCache {

  constructor(cachePath) {
    db = new LokiConstructor(cachePath + '/salog.db');
    this._databaseInitialize();
  }

  _databaseInitialize() {
    if (events === null) {
      events = db.getCollection("events");
    }
    if (events === null) {
      events = db.addCollection("events");
    }
  }

  test() {
    // db = new LokiConstructor(cachePath + '/salog.db');
    console.log(db);
    db.loadDatabase({}, function(err) {
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
        })
      }
    })
  }

  cacheLog(message) {
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
    db.saveDatabase();
    // });

  }

  selectAll() {
    this._databaseInitialize();
    return new Promise((resolve, reject) => {
      db.loadDatabase({}, function(err) {
        if (err) {
          reject(err)
        } else {
          var _collection = db.getCollection("events");
          if (!_collection) {
            // console.log("Collection %s does not exit. Creating ...", "events");
            _collection = db.addCollection('events');
          }
          resolve(_collection.find())
        }
      })
    })
  }

  deleteById(row) {
    var events = db.getCollection("events");
    events.remove(row);
    db.saveDatabase(function(err) {
      if (err) {
        console.log(err);
      }
    });
  }

  async uploadCache(upload) {
    this.selectAll().then((rows) => {
      rows.forEach((row, i) => {
        this.deleteById(row)
        const message = JSON.parse(row.message)
        if (message._track_id) {
          upload(message)
        }
      })
    }).catch((err) => {
      console.log(err)
    })
  }
}
export default DBCache