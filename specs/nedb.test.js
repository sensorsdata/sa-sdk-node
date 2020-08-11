// 加载模块
const nedb = require('nedb');

// 实例化连接对象（不带参数默认为内存数据库）
const db = new nedb({
    filename: __dirname + '/data/save.db',
    autoload: true
});

// 插入单项
db.insert({
    name: 'tom'
}, (err, ret) => {});

// 插入多项
db.insert(
    [
        { name: 'tom' },
        { name: 'jerry' }
    ], (err, ret) => {});

// // 查询单项
// db.findOne({
//     name: 'tom'
// }, (err, ret) => {});

// 查询多项
// db.find({
//         name: {
//             $in: ['tom', 'jerry']
//         }
//     })
//     .sort({
//         _id: -1
//     })
//     .exec((err, ret) => {});

// 更新单项
// db.update({
//     _id: '1'
// }, {
//     $set: {
//         name: 'kitty'
//     }
// }, (err, ret) => {});

// 更新多项
// db.update({}, {
//     $set: {
//         name: 'kitty'
//     }
// }, {
//     multi: true
// }, (err, ret) => {});

// // 删除单项
// db.remove({
//     _id: '1'
// }, (err, ret) => {})

// // 删除多项
// db.remove({
//     name: 'kitty'
// }, {
//     multi: true
// }, (err, ret) => {});

// Find all documents in the collection
db.find({}, function(err, docs) {
    if (err) {
        console.log(err);
    } else {
        docs.forEach(element => {
            db.remove({ _id: element._id }, function(err, numRemoved) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(numRemoved);
                }
            });
        });
    }
});