'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.version = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const packageInfoText = _fs2.default.readFileSync(_path2.default.resolve(__dirname, '../package.json'), { encoding: 'utf8' });
const packageInfo = JSON.parse(packageInfoText);

const version = exports.version = packageInfo.version;