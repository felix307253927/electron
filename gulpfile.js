/**
 * @author Created by felix on 17-5-18.
 * @email   307253927@qq.com
 */
'use strict';

const gulp   = require("gulp");
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

gulp.task('opus', () => {
  gulp.src(['opus/resampler.js', 'opus/libopus.js', 'opus/opus_encoder.js'])
    .pipe(concat('opus_encoder.js'))
    .pipe(uglify({output: {max_line_len: 3200000}}))
    .pipe(gulp.dest("src/js"))
});