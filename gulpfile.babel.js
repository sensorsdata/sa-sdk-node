import gulp from 'gulp'
import babel from 'gulp-babel'
import shell from 'gulp-shell'

const presets = [
  ['@babel/env'],
]
module.exports = {
  presets,
}
gulp.task('test', (done) => {
  console.log('It works!')
  done()
})

gulp.task('babel', () => gulp
  .src('src/*.js')
  .pipe(
    babel({
      presets: ['@babel/preset-env'],
    })
  )
  .pipe(gulp.dest('dist')))

gulp.task('spec:ut', () => gulp
  .src('*.js', {
    read: false,
  })
  .pipe(
    shell([
      './node_modules/.bin/mocha --harmony --opts mocha.opts "specs/**/*Spec.js"',
    ])
  ))

gulp.task('spec', gulp.parallel('spec:ut'))

gulp.task('watch', () => {
  gulp.watch('src/*.js', gulp.series('babel'))
})

gulp.task('spec:smoke', () => gulp
  .src('*.js', {
    read: false,
  })
  .pipe(
    shell([
      'DEBUG=sa:* ./node_modules/.bin/mocha --harmony --opts mocha.opts "specs/smokingTest.js"',
    ])
  ))

gulp.task('build:babel', () => gulp
  .src('src/*.js')
  .pipe(babel())
  .pipe(gulp.dest('lib')))

gulp.task('build', gulp.parallel('build:babel'))
