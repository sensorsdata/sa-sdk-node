import gulp from 'gulp'
import bump from 'gulp-bump'
import start from 'gulp-start-process'
import loadConfig from 'config-node'
import createKnex from 'knex'
import moment from 'moment'
global.moment = moment

const config = loadConfig({ env: 'common' })()

gulp.task('default', ['spec'])

;['api', 'www', 'server'].forEach((appName) => {
  gulp.task(appName, [`${appName}:dev`])
  gulp.task(`${appName}:dev`, (done) => {
    start(`nodemon bin/${appName} | bunyan`, done)
  })
  gulp.task(`${appName}:prod`, (done) => {
    start(`node bin/${appName}`, done)
  })
})

;['major', 'minor', 'patch'].forEach((type) => {
  gulp.task(`bump:${type}`, ['build'], () =>
    gulp.src('./package.json')
    .pipe(bump({ type }))
    .pipe(gulp.dest('./'))
  )
})
gulp.task('bump', ['bump:patch'])

function initKnex() {
  return createKnex({
    client: 'mysql',
    connection: {
      socketPath: '/tmp/mysql.sock',
      user: 'root',
    },
    debug: true,
  })
}

gulp.task('db:create', () => {
  const databaseName = config.database.connection.database

  const knex = initKnex()
  return knex.raw(`CREATE DATABASE IF NOT EXISTS ${databaseName};`)
  .then(() => knex.destroy())
})
gulp.task('db:drop', () => {
  const databaseName = config.database.connection.database

  const knex = initKnex()
  return knex.raw(`DROP DATABASE IF EXISTS ${databaseName};`)
  .then(() => knex.destroy())
})
gulp.task('db:reset', ['db:drop', 'db:create'])
gulp.task('db:migrate', (done) => {
  start('knex migrate:latest', done)
})
gulp.task('db:rollback', (done) => {
  start('knex migrate:rollback', done)
})
gulp.task('db:rebuild', ['db:reset', 'db:migrate'])

gulp.task('spec', ['spec:local'])

gulp.task('spec:local', (done) => {
  start('NODE_ENV=test ./node_modules/.bin/mocha --harmony --grep @remote --invert --opts mocha.opts "specs/**/*Spec.js"', done)
})

gulp.task('spec:remote', (done) => {
  start('NODE_ENV=test ./node_modules/.bin/mocha --harmony --grep @remote --opts mocha.opts --timeout 5000  "specs/**/*Spec.js"', done)
})

gulp.task('spec:all', (done) => {
  start('NODE_ENV=test ./node_modules/.bin/mocha --harmony --opts mocha.opts  --timeout 5000 "specs/**/*Spec.js"', done)
})
