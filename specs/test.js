/**
 * Created by m1911 on 16/12/14.
 */
const SensorsdataAnanlytics = require('../lib/SensorsAnalytics').default

const sa = new SensorsdataAnanlytics()

const URL = 'http://127.0.0.1:8106/sa?project=default'
sa.initLoggingConsumer(__dirname, true)
sa.disableReNameOption()
sa.submitTo(URL, { gzip: true, mode: 'debug', timeout: 10 * 1000 })
sa.registerSuperProperties({
  $app_version: '0.3.0',
  env: process.env.NODE_ENV || 'default',
})

// 商品 Type
const itemType = 'book'
// 商品 ID
const itemId = '0321714113'
// 商品信息
const properties = {
  name: 'C++ Primer',
  price: 31.54,
}
// 添加商品
sa.itemSet(itemType, itemId, properties)
// 删除商品
sa.itemDelete(itemType, itemId)

// module.exports = sa
// let n = 1000
// while (n--) {
//   sa.track('bsfjsfish', 'dsda')
// }
