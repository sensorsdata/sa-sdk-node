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
db.selectAll().then((rows) => {
    rows.forEach(event => {
        console.log(event.message);
    });
}).catch((err) => {
    console.log(err);
})