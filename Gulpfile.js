'use strict';
const gulp = require('gulp');
const bowerfiles = require('main-bower-files');
const concat = require('gulp-concat');
const less = require('gulp-less');
const debug = require('gulp-debug');
const annotate = require('gulp-ng-annotate');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const gulpif = require('gulp-if');
const del = require('del');
const replace = require('gulp-replace');
const cache = require('gulp-cached');
const env = (process.env.NODE_ENV || 'development');
const config = {
    paths: {
        build:  'build',
        target: 'public'
    }
};


// Export main files from bower components
// =======================================
gulp.task('bower', (done) => {
    gulp.src(bowerfiles(), { base: 'bower_components' })
        .pipe(gulp.dest(config.paths.build))
        .on('end', done)
    ;
});


// Configure and compiles less files
// =================================
gulp.task('less:configure:bootstrap', ['bower'], (done) => {
    gulp.src('app/**/*.less')
        .pipe(gulp.dest(`${config.paths.build}/bootstrap`))
        .on('end', done)
    ;
});

gulp.task('less:compile:bootstrap', ['less:configure:bootstrap'], (done) => {
    gulp.src(`${config.paths.build}/bootstrap/less/bootstrap.less`)
        .pipe(cache('boostrap.css'))
        .pipe(less())
        .pipe(rename('bootstrap.css'))
        .pipe(gulp.dest(config.paths.build))
        .on('end', done)
    ;
});

gulp.task('less:compile:theme', ['less:configure:bootstrap'], (done) => {
    gulp.src(`${config.paths.build}/bootstrap/less/theme.less`)
        .pipe(less())
        .pipe(rename('theme.css'))
        .pipe(gulp.dest(config.paths.build))
        .on('end', done)
    ;
});

gulp.task('styles:compile', ['less:compile:bootstrap', 'less:compile:theme'], (done) => {
    gulp
        .src([
            `${config.paths.build}/bootstrap.css`,
            `${config.paths.build}/fontawesome/css/font-awesome.css`,
            `${config.paths.build}/theme.css`
        ])
        .pipe(sourcemaps.init())
        .pipe(debug({ title: 'CSS' }))
        .pipe(concat('app.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(config.paths.target))
        .on('end', done)
    ;
});

// Configure and compiles javascripts files
// ========================================
gulp.task('javascript:compile:vendors', ['bower'], (done) => {
    gulp
        .src([
            `${config.paths.build}/**/*.js`,
            `!${config.paths.build}/vendors.js`
        ])
        .pipe(cache('vendors.js'))
        .pipe(sourcemaps.init())
        .pipe(concat('vendors.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(config.paths.build))
        .on('end', done)
    ;
});

gulp.task('javascript:compile', ['javascript:compile:vendors'], (done) => {
    gulp
        .src([
            `${config.paths.build}/vendors.js`,
            `app/**/*.js`
        ])
        .pipe(sourcemaps.init())
        .pipe(annotate())
        .pipe(debug({ title: 'JS' }))
        .pipe(concat('app.js'))
        // Replaces ${ENV:VARNAME} pattern with VARNAME environment var
        .pipe(replace(/\$\{ENV:(\b.*\b)\}/g, (match, varname) => process.env[varname] || ''))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(config.paths.target))
        .on('end', done)
    ;
});


// Copy assets
// =====================================
gulp.task('copy:assets', ['bower'], (done) => {
    gulp
        .src([
            'app/assets/**/*.*',
            `${config.paths.build}/**/fonts/*.*`,
        ])
        .pipe(rename((path) => {
            if (/(.*)\/fonts/.test(path.dirname)) {
                path.dirname = 'fonts';
            }
            return path;
        }))
        .pipe(gulp.dest(config.paths.target))
        .on('end', done)
    ;
});


// Watch for modifications
// =======================
gulp.task('watch', () => {
    gulp.watch(['app/**/*.less'], ['styles:compile']);
    gulp.watch(['app/**/*.js'], ['javascript:compile']);
    gulp.watch(['app/assets/**/*.*'], ['copy:assets']);
});

// Cleaning
// ========
const clean = function (done) {
    let paths = [];
    for (let key of Object.keys(config.paths)) {
        paths.push(config.paths[key]);
    }
    del.sync(paths);
    done();
};

gulp.task('clean', (done) => {
    clean(done);
});

// Build task
// ===============
gulp.task('build', ['styles:compile', 'javascript:compile', 'copy:assets'], (done) => {
    if (env === 'production') {
        clean(done);
    } else {
        done();
    }
});


// Default task
// ============
gulp.task('default', ['build']);
