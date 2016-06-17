'use strict'

var gulp = require('gulp')

var sigServer = require('./src/sig-server')
var sigS

gulp.task('test:browser:before', (done) => {
  sigS = sigServer.start(15555, done)
})

gulp.task('test:browser:after', (done) => {
  sigS.stop(done)
})

require('aegir/gulp')(gulp)
