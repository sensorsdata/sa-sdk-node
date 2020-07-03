const DBCache = require("../lib/db").default

const db = new DBCache(__dirname)

// console.log(db);

// db.cacheLog("111")

db.uploadCache((message) => {
  console.log(message);
})