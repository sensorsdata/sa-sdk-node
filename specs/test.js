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

sa.itemSet('book', '0321714113', { name: 'C++ Primer', price: 31.54 })
sa.itemDelete('book', '0321714113')

// module.exports = sa
// let n = 1000
// while (n--) {
//   sa.track('bsfjsfish', 'dsda')
// }
