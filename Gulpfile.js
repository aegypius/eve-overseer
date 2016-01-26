'use strict';
const gulp = require('gulp');
const concat = require('gulp-concat');
const less = require('gulp-less');
const debug = require('gulp-debug');
const annotate = require('gulp-ng-annotate');
const uglify = require('gulp-uglify');
const cssnano = require('gulp-cssnano');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const gulpif = require('gulp-if');
const del = require('del');
const replace = require('gulp-replace');
const cache = require('gulp-cached');
const env = (process.env.NODE_ENV || 'development');
const config = {
    less: {
        paths: [
            'app/less',
            'node_modules/bootstrap/less',
            'node_modules/font-awesome/less',
            'node_modules'
        ]
    },
    assets: {
        stylesheets : [
            'app/**/*.less',
        ],
        javascripts: [
            'node_modules/jquery/dist/jquery.js',
            'node_modules/bootstrap/dist/js/bootstrap.js',
            'node_modules/angular/angular.js',
            'node_modules/angular-resource/angular-resource.js',
            'node_modules/angular-sanitize/angular-sanitize.js',
            'node_modules/angular-ui-router/build/angular-ui-router.js',
            'node_modules/ng-storage/ngStorage.js',
            'app/app.js',
            'app/**/*.js'
        ],
        staticfiles: [
            'app/assets/**/*.html',
            'node_modules/bootstrap/fonts/**/*.*',
            'node_modules/font-awesome/fonts/**/*.*'
        ]
    },
    output: 'public'
};

// Configure and compiles less files
// =================================
gulp.task('stylesheets', [], (done) => {
    gulp.src(config.assets.stylesheets)
        .pipe(sourcemaps.init())
        .pipe(debug({ title: 'CSS' }))
        .pipe(less(config.less))
        .pipe(concat('app.css'))
        .pipe(cssnano())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(config.output))
        .on('end', done)
    ;
});

// Configure and compiles javascripts files
// ========================================
gulp.task('javascripts', [], (done) => {
    gulp
        .src(config.assets.javascripts)
        .pipe(sourcemaps.init())
        .pipe(annotate())
        .pipe(debug({ title: 'JS' }))
        .pipe(concat('app.js'))
        // Replaces ${ENV:VARNAME} pattern with VARNAME environment var
        .pipe(replace(/\$\{ENV:(\b.*\b)\}/g, (match, varname) => process.env[varname] || ''))
        .pipe(uglify())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(config.output))
        .on('end', done)
    ;
});


// Copy assets
// =====================================
gulp.task('staticfiles', [], (done) => {
    gulp.src(config.assets.staticfiles)
        .pipe(rename((path) => {
            if (/(glyphicons|fontawesome)/i.test(path.basename)) {
                path.dirname = 'fonts';
            }
            return path;
        }))
        .pipe(debug({ title: 'STATIC' }))
        .pipe(gulp.dest(config.output))
        .on('end', done)
    ;
});


// Watch for modifications
// =======================
gulp.task('watch', ['build'], () => {
    gulp.watch(config.assets.stylesheets, ['stylesheets']);
    gulp.watch(config.assets.javascripts, ['javascripts']);
    gulp.watch(config.assets.staticfiles, ['staticfiles']);
});

// Cleaning
// ========
const clean = function (done) {
    del.sync(config.output);
    done();
};

gulp.task('clean', (done) => {
    clean(done);
});

// Build task
// ===============
gulp.task('build', ['stylesheets', 'javascripts', 'staticfiles'], (done) => {
    if (env === 'production') {
        clean(done);
    } else {
        done();
    }
});


// Default task
// ============
gulp.task('default', ['build']);
