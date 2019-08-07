"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.version = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const packageInfoText = _fs.default.readFileSync(_path.default.resolve(__dirname, '../package.json'), {
  encoding: 'utf8'
});

const packageInfo = JSON.parse(packageInfoText);
const version = packageInfo.version;
exports.version = version;