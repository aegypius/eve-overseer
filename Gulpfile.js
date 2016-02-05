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
const remember = require('gulp-remember');

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
            'node_modules/angular-multi-select/dist/angular-multi-select.css',
        ],
        javascripts: [
            'node_modules/jquery/dist/jquery.js',
            'node_modules/bootstrap/dist/js/bootstrap.js',
            'node_modules/angular/angular.js',
            'node_modules/angular-resource/angular-resource.js',
            'node_modules/angular-sanitize/angular-sanitize.js',
            'node_modules/angular-ui-router/build/angular-ui-router.js',
            'node_modules/ng-storage/ngStorage.js',
            'node_modules/chart.js/Chart.js',
            'node_modules/angular-chartjs/dist/angular-chartjs.js',
            'node_modules/moment/min/moment-with-locales.js',
            'node_modules/angular-filter/dist/angular-filter.js',
            'node_modules/angular-multi-select/dist/angular-multi-select.js',
            'app/app.js',
            'app/**/*.js'
        ],
        copy: [
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
        .pipe(cache('stylesheets'))
        .pipe(debug({ title: '>'}))
        .pipe(less(config.less))
        .pipe(replace(/\.{2}\/fonts/g, './fonts'))
        .pipe(cssnano())
        .pipe(remember('stylesheets'))
        .pipe(concat('app.css'))
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
        .pipe(cache('javascripts'))
        .pipe(annotate())
        .pipe(debug({ title: '>'}))
        // Replaces ${ENV:VARNAME} pattern with VARNAME environment var
        .pipe(replace(/\$\{ENV:(\b.*\b)\}/g, (match, varname) => process.env[varname] || ''))
        .pipe(uglify())
        .pipe(remember('javascripts'))
        .pipe(concat('app.js'))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(config.output))
        .on('end', done)
    ;
});


// Copy assets
// =====================================
gulp.task('copy', [], (done) => {
    gulp.src(config.assets.copy)
        .pipe(rename((path) => {
            if (/(glyphicons|fontawesome)/i.test(path.basename)) {
                path.dirname = 'fonts';
            }
            return path;
        }))
        .pipe(debug({ title: '>'}))
        .pipe(gulp.dest(config.output))
        .on('end', done)
    ;
});


// Watch for modifications
// =======================
gulp.task('watch', ['build'], () => {
    const handleCache = function (name) {
        return function (event) {
            if (event.type === 'deleted') {
                delete cache.caches[name];
                remember.forget(name, event.path);
            }
        };
    };

    gulp.watch(config.assets.stylesheets, ['stylesheets']).on('change', handleCache('stylesheets'));
    gulp.watch(config.assets.javascripts, ['javascripts']).on('change', handleCache('javascripts'));
    gulp.watch(config.assets.copy, ['copy']).on('change', handleCache('copy'));
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
gulp.task('build', ['stylesheets', 'javascripts', 'copy'], (done) => {
    if (env === 'production') {
        clean(done);
    } else {
        done();
    }
});


// Default task
// ============
gulp.task('default', ['build']);
