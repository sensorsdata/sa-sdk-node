"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.version = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var packageInfoText = _fs.default.readFileSync(_path.default.resolve(__dirname, "../package.json"), {
  encoding: "utf8"
});

var packageInfo = JSON.parse(packageInfoText);
var version = packageInfo.version;
exports.version = version;