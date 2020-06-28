import {
  Database
} from "sqlite3";
import * as _ from 'lodash'

let db;

class DBCache {



  constructor(cachePath) {

    db = new Database(cachePath + '/salog.db');
    db.serialize(()=>{
      let sql = `CREATE TABLE IF NOT EXISTS salog(id INTEGER PRIMARY KEY AUTOINCREMENT,log TEXT)`;
      db.run(sql)
    })

    // this.db = new Database(cachePath + '/salog.db', (err) => {
    //   if (err) {
    //     console.log(err)
    //   } else {
    //     this.db.run(`CREATE TABLE IF NOT EXISTS salog(id INTEGER PRIMARY KEY AUTOINCREMENT,log TEXT)`, (err) => {
    //       if (err) {
    //         console.log(err)
    //       }
    //     })
    //   }
    // })
  }

  cacheLog(message) {
    db.run('INSERT INTO salog(log) VALUES(?)', [message], function(err) {
      if (err) {
        return console.log('insert data error: ', err.message)
      }
    })
  }

  selectAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM salog', [], function(err, rows) {
        if (err) {
          reject(err)
        }
        resolve(rows)
      })
    })
  }

  deleteById(id) {
    db.run(`DELETE FROM salog WHERE id = ?`, [id], (err) => {
      if (err) {
        console.log(err)
      }
    })
  }

  async uploadCache(upload) {
    this.selectAll().then((rows) => {
      _.forEach(rows, (id, log) => {
        const message = JSON.parse(id.log)
        if (message._track_id) {
          upload(message)
        }
        this.deleteById(id.id)
      })
    }).catch((err) => {
      console.log(err)
    })
  }
}
export default DBCache