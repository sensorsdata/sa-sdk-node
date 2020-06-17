import {
  Database
} from "sqlite3";
import * as _ from 'lodash'

class DBCache {

  constructor(cachePath) {
    console.log(cachePath + '/salog.db');
    
    this.db = new Database(cachePath + '/salog.db', (err) => {
      if (err) {
        console.log(err)
        return
      }
      this.db.run(`CREATE TABLE IF NOT EXISTS salog(id INTEGER PRIMARY KEY AUTOINCREMENT,log TEXT)`, (err) => {
        if (err) {
          console.log(err)
        }
      })
    })
  }

  cacheLog(message) {
    this.db.run('INSERT INTO salog(log) VALUES(?)', [message], function(err) {
      if (err) {
        return console.log('insert data error: ', err.message)
      }
    })
  }

  selectAll() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM salog', [], function(err, rows) {
        if (err) {
          reject(err)
        }
        resolve(rows)
      })
    })
  }

  deleteById(id) {
    this.db.run(`DELETE FROM salog WHERE id = ?`, [id], (err) => {
      if (err) {
        console.log(err)
      }
    })
  }

  uploadCache(upload) {
    this.selectAll().then((rows) => {
      _.forEach(rows, (id, log) => {
        const message = JSON.parse(id.log)
        if (message._track_id) {
          // console.log(message._track_id)
          upload(message)
        }
        this.deleteById(id.id)
      })
    })
  }
}
export default DBCache