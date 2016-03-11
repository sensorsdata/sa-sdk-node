import fs from 'fs'

const packageInfoText = fs.readFileSync('../package.json', { encoding: 'utf8' })
const packageInfo = JSON.parse(packageInfoText)

export const version = packageInfo.version
