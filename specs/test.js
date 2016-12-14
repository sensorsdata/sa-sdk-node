/**
 * Created by m1911 on 16/12/14.
 */
var SensorsdataAnanlytics = require('../lib/SensorsAnalytics').default;

var sa = new SensorsdataAnanlytics;
var url = 'http://{$service_name}.cloud.sensorsdata.cn:8006/sa?project={$project_name}&token={$project_token}';
// 是否允许重命名字段
sa.enableReNameOption();
// Basic Usage
sa.submitTo(url, {
  mode: 'track',
  timeout: 10 * 1000
});

var id = 'test';
for (var i = 0; i < 50; i++) {
  sa.trackSignup(id + i, 'node/node');
  sa.profileSet(id + i, { age: 18, name: '小四', gender: 'female' });
  sa.track(id + i, 'ABCD_HELP', {
    cname: '测试',
    lib: 'Node',
    Version: '1.0.10  ',
    ABCD_DEE: '正则匹配'
  });
}

// Super Properties that assigned to every event tracking
sa.registerSuperProperties({
  $appVersion: '1.0.0',
  env: 'production'
});

// Track event
sa.track('12345', 'Hello');

// Track event with custom properties
sa.track('12345', 'Hello', {
  orderId: '12345'
});
