/**
 * Created by m1911 on 16/12/14.
 */
const SensorsdataAnanlytics = require('../lib/SensorsAnalytics').default

const sa = new SensorsdataAnanlytics()

const URL = 'https://newsdktest.datasink.sensorsdata.cn/sa?project=weiyi&token=5a394d2405c147ca'

// sa.initLoggingConsumer(__dirname)
sa.initNWConsumer({
    url: URL, // 数据接收地址
    cachePath: __dirname, // 缓存路径
    timeout: 1 * 1000 // 发送数据超时时间
})
sa.disableReNameOption()
    // sa.submitTo(URL, {
    //   gzip: true,
    //   mode: 'debug',
    //   timeout: 10 * 1000,
    // })
sa.registerSuperProperties({
    // $app_version: '0.3.0',
    env: process.env.NODE_ENV || 'default',
})
sa.profileSet('111', {
        aa: 'bb',
    })
    // sa.trackSignup('111', '222')
    // sa.track('111', 'aaa', {})
    // 商品 Type
const itemType = 'book'
    // 商品 ID
const itemId = '0321714113'
    // 商品信息
const properties = {
        name: 'C++ Primer',
        c_name: 'C++ Primer',
        price: 31.54,
    }
    // 添加商品
sa.itemSet(itemType, itemId, properties)
    // 删除商品
sa.itemDelete(itemType, itemId)



// // module.exports = sa
// let n = 10
// while (n--) {
//     sa.disableReNameOption()
//     sa.profileSet(`bsfjsfish${n}`, {
//         userHappy: n
//     })
//     sa.track('bsfjsfish', 'user_happy')
//     sa.track('111', 'aaa', {})
// }