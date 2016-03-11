'use strict';

var _Submitter = require('./Submitter');

var _Submitter2 = _interopRequireDefault(_Submitter);

var _SensorsAnalytics = require('./SensorsAnalytics');

var _SensorsAnalytics2 = _interopRequireDefault(_SensorsAnalytics);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Use module.exports to ensure compatiblity with non-es6 projects
exports = module.exports = _SensorsAnalytics2.default;
exports.Submitter = _Submitter2.default;