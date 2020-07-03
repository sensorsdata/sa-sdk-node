import fs from 'fs'
import pathUtil from 'path'

const packageInfoText = fs.readFileSync(pathUtil.resolve(__dirname, '../package.json'), { encoding: 'utf8' })
const packageInfo = JSON.parse(packageInfoText)

// eslint-disa ble-nex t-line import/prefer-default-export
// eslint-disable-next-line import/prefer-default-export
export const { version } = packageInfo
