"use strict";

var _Submitter = _interopRequireDefault(require("./Submitter"));

var _SensorsAnalytics = _interopRequireDefault(require("./SensorsAnalytics"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Use module.exports to ensure compatiblity with non-es6 projects
exports = module.exports = _SensorsAnalytics.default;
exports.Submitter = _Submitter.default;