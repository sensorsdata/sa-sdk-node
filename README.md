# THE MAINTENANCE IS MOVED TO OFFICIAL REPO:
# https://github.com/sensorsdata/sa-sdk-node

Sensors Analytics  [![NPM version][npm-image]][npm-url] [![Build Status][ci-image]][ci-url] [![Dependency Status][depstat-image]][depstat-url]
==============================

> This is the home-brewed version of Node SDK for [Sensors Analytics].

## Install

Install using [npm][npm-url].

    $ npm install sa-sdk-node --save

##Attention

In the latest version(v1.0.8), we added a option named `allowReNameOption` valued `true` by default.
In this case, we change the property value and the keys to snake style with '_'. 
eg:
```js
// when 'allowReNameOption' is true
sa.track('user-id', 'userHappy', {
  '$appVersion': '1.0.0',
  'orderId': '123'
})

// then we get the data
{
...
'event': 'user_happy'
'properties': {
  '$app_version': '1.0.0',
  'order_id': '123'
}
...
}
```

You can use `sa.disableReNameOption()` to set `allowReNameOption` to be `false`.
In this case, when you set default property, you must use like `$app_version`, `$appVersion` style could be error. Refer to [Data schema](https://sensorsdata.cn/manual/data_schema.html) for more detail.
Property name like `orderId` will be kept.
## Usage

### Basic Usage

```js
import SensorsAnalytics from 'sa-sdk-node'

const sa = new SensorsAnalytics()

sa.submitTo('http://xxx.cloud.sensorsdata.cn:8006/sa?token=xxx')

// Super Properties that assigned to every event tracking
sa.registerSuperProperties({ $appVersion: '1.0.0', env: 'production' })

// Track event
sa.track('user-id', 'userHappy')

// Track event with custom properties
sa.track('user-id', 'newOrder', { orderId: '12323' })

// Track Signup
sa.trackSignup('user-id', 'anonymous-id/device-id')

// Track Signup with custom properties
sa.trackSignup('user-id', 'anonymous-id/device-id', { userType: 'administrator' })

// Manipuate user project
sa.profileSet('user-id', { age: 18 })
sa.profileSetOnce('user-id', { registerTime: new Date().valueOf() })
sa.profileIncrement('user-id', { scoreCount: 100, issueCount: -1 })
sa.profileAppend('user-id', { tags: ['student', 'developer'] })
sa.profileUnset('user-id', ['temporaryTag'])

```
For more detailed information about each api, checkout [Sensors Analytics manual]

#### Override event time

By default, the library uses current time as the time when event occurs,
but the behavior can be overrode by `$time` property.

* Both `track` and `trackSignup` support this feature.
* `$time` can be `Date`, `number`, `string`, `Moment` instance

```js
import moment from 'moment'

sa.track('user-id', 'newOrder', { orderId: '12323', $time: new Date(2016,7,30) })
sa.track('user-id', 'newOrder', { orderId: '12323', $time: '2016-07-30T00:00:00+08:00' })
sa.track('user-id', 'newOrder', { orderId: '12323', $time: 1469808000000 })
sa.track('user-id', 'newOrder', { orderId: '12323', $time: moment() })

sa.trackSignup('user-id', 'anonymous-id/device-id', { $time: new Date(2016,7,30) })
sa.trackSignup('user-id', 'anonymous-id/device-id', { $time: '2016-07-30T00:00:00+08:00' })
sa.trackSignup('user-id', 'anonymous-id/device-id', { $time: 1469808000000 })
sa.trackSignup('user-id', 'anonymous-id/device-id', { $time: moment() })
```

#### Parse Geolocation

SensorsData support parsing user geo location from IP address.

* Both `track` and `trackSignup` support this feature.

```js
router.post('/api/new-order', (req, res) => {
  sa.track(req.session.userId, 'newOrder', { $ip: req.ip })

  // ...
})
```

#### Parse User Agent

Node SDK supports parsing client `OS`, `OS version`, `Browser`, `Browser version`, `Browser Engine`, `Model` from client's `User Agent`

* Both `track` and `trackSignup` support this feature.

```js
router.post('/api/new-order', (req, res) => {
  sa.track(req.session.userId, 'newOrder', { $userAgent: req.get('user-agent') })
  // ...
})
```

### Config Submitter

By default, submitter can be created with server url
```js
import SensorsAnalytics from 'sa-sdk-node'

const url = 'http://xxx.cloud.sensorsdata.cn:8006/sa?token=xxx'

const sa = new SensorsAnalytics()

const submitter = sa.submitTo(url)
```

But it also can be created with explicit config

```js
import SensorsAnalytics from 'sa-sdk-node'

const url = 'http://xxx.cloud.sensorsdata.cn:8006/sa?token=xxx'

const sa = new SensorsAnalytics()

const submitter = sa.submitTo({ url, gzip: true, mode: 'track', timeout: 10 * 1000 })
// gzip: whether enable gzip, default to true
// mode: could be 'track' (production use), 'debug' (diagnosis data), 'dryRun' (diagnosis with no data recorded),
//       also supports the values that aligned to other SDKs: debug_off, debug_and_track and debug_only,
//       default to track
// mode:
// timeout: Http timeout in ms, default to 10s
```

Submitter can be create manually and attach to `SensorsAnalytics` manually

Created with url with default config

```js
import SensorsAnalytics, { Submitter } from 'sa-sdk-node'

const url = 'http://xxx.cloud.sensorsdata.cn:8006/sa?token=xxx'

const sa = new SensorsAnalytics()

const submitter = new Submitter(url)

sa.subscribe(submitter)
```
Or with explicit config

```js
import SensorsAnalytics, { Submitter } from 'sa-sdk-node'

const url = 'http://xxx.cloud.sensorsdata.cn:8006/sa?token=xxx'

const sa = new SensorsAnalytics()

const submitter = new Submitter({ url, gzip: true, mode: 'track', timeout: 10 * 1000 })

sa.subscribe(submitter)
```

Network error handling

```js
submitter.catch((err) => console.error(err))
```

### Batch Submit

**WARN** Batch submit is not supported by `debug` or `dryRun` mode. It causes 400 bad-request error

Suppose

```js
import SensorsAnalytics, { Submitter } from 'sa-sdk-node'

const url = 'http://xxx.cloud.sensorsdata.cn:8006/sa?token=xxx'

const sa = new SensorsAnalytics()
```

#### Batch with count
```js
// Submit when 20 events are tracked
sa.submitTo(url, { count: 20 })
```

#### Batch with time
```js
// Submit when every 5 seconds
sa.submitTo(url, { timeSpan: 5 * 1000 })
```

#### Batch with time or count
```js
// Submit every 5 seconds, but also submit immediately if 20 events tracked
sa.submitTo(url, { count: 20, timeSpan: 5 * 1000 })
```

#### Create batch manually

`Batch` can be created manually if needed, which can be subscribed with `submitter` later

```js
const batch = sa.inBatch({ count: 20, timeSpan: 5 * 1000 })

batch.subscribe(new Submitter(url))
```

### Advanced Usage

This library is powered by Microsoft's [RxJS].

`SensorsAnalytics` is an [Observable], which yields tracking data.

`Submitter` is an [Observer], which consume the tracking data.

`Submitter` is also an [Observable], which yields next when submitted succeeded, and yields `Error` when network errors.

Ideally, you can use all [RxJS] tricks with this library

### Filtering
```js
// All the event that raised by debug build app won't be submitted
sa.filter((event) => event.properties.releaseType !== 'debug')
  .subscribe(submitter)
```

### Debounce
```js
// Useful while tracking user input or other case
// The event won't be tracked unless user has stopped typing for 500ms
sa.debounce(500)
  .subscribe(submitter)

textInput.onChange((text) => sa.track(userId, 'userType', { text }))
```

### More Detail

For more detail, checkout Microsoft's [Rx documentation]

## License
MIT

[![NPM downloads][npm-downloads]][npm-url]

[homepage]: https://github.com/timnew/sa-sdk-node

[npm-url]: https://npmjs.org/package/sa-sdk-node
[npm-image]: http://img.shields.io/npm/v/sa-sdk-node.svg?style=flat
[npm-downloads]: http://img.shields.io/npm/dm/sa-sdk-node.svg?style=flat

[ci-url]: https://travis-ci.org/timnew/sa-sdk-node/
[ci-image]: https://img.shields.io/travis/timnew/sa-sdk-node.svg?style=flat

[depstat-url]: https://gemnasium.com/timnew/sa-sdk-node
[depstat-image]: http://img.shields.io/gemnasium/timnew/sa-sdk-node.svg?style=flat

[Sensors Analytics]: http://sensorsdata.cn/
[Sensors Analytics manual]: http://sensorsdata.cn/manual/index.html
[RxJS]: https://github.com/Reactive-Extensions/RxJS
[Observable]: https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observable.md
[Observer]: https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observer.md
[Rx documentation]: https://github.com/Reactive-Extensions/RxJS/tree/master/doc
