const DBCache = require("../lib/db").default

const db = new DBCache(__dirname)

// db.test();

// console.log(db);

// db.cacheLog('111')
// db.selectAll()
//   .then((rows) => {
//     console.log(rows)
//   })
//   .catch((err) => {
//     console.log(err)
//   });
db.uploadCache((message) => {
  console.log(message);
})