(require "dotenv").load()
gulp       = require "gulp"
bowerfiles = require "main-bower-files"
concat     = require "gulp-concat"
less       = require "gulp-less"
debug      = require "gulp-debug"
annotate   = require "gulp-ng-annotate"
uglify     = require "gulp-uglify"
sourcemaps = require "gulp-sourcemaps"
rename     = require "gulp-rename"
gulpif     = require "gulp-if"
del        = require "del"
replace    = require "gulp-replace"
cache      = require "gulp-cached"

lr         = (require "tiny-lr")()
refresh    = require "gulp-livereload"
livereload = require "connect-livereload"
embedlr    = require "gulp-embedlr"

env            = process.env.NODE_ENV        or "development"
port           = process.env.PORT            or 3333
liveReloadPort = process.env.LIVERELOAD_PORT or 35729

config =
  paths:
    build:  "build"
    target: "public"


# Export main files from bower components
# =======================================
gulp.task "bower", ->
  gulp
    .src bowerfiles(), base: 'bower_components'
    .pipe gulp.dest "#{config.paths.build}"


# Configure and compiles less files
# =================================
gulp.task "less:configure:bootstrap", ["bower"], ->
  gulp
    .src "app/**/*.less"
    .pipe gulp.dest "#{config.paths.build}/bootstrap"

gulp.task "less:compile:bootstrap", ["less:configure:bootstrap"], ->
  gulp
    .src "#{config.paths.build}/bootstrap/less/bootstrap.less"
    .pipe cache "boostrap.css"
    .pipe less()
    .pipe rename "bootstrap.css"
    .pipe gulp.dest "#{config.paths.build}"

gulp.task "less:compile:theme", ["less:configure:bootstrap"], ->
  gulp
    .src "#{config.paths.build}/bootstrap/less/theme.less"
    .pipe less()
    .pipe rename "theme.css"
    .pipe gulp.dest "#{config.paths.build}"

gulp.task "less:compile", [
  "less:compile:bootstrap"
  "less:compile:theme"
  ], ->
  gulp
    .src [
      "#{config.paths.build}/bootstrap.css"
      "#{config.paths.build}/fontawesome/css/font-awesome.css"
      "#{config.paths.build}/theme.css"
    ]
    .pipe sourcemaps.init()
    .pipe concat "app.css"
    .pipe sourcemaps.write()
    .pipe gulp.dest config.paths.target
    .pipe gulpif env is "development", refresh lr

# Configure and compiles javascripts files
# ========================================
gulp.task "javascript:compile:vendors", ["bower"], ->
  gulp.src [
    "#{config.paths.build}/**/*.js"
    "!#{config.paths.build}/vendors.js"
  ]
  .pipe cache "vendors.js"
  .pipe sourcemaps.init()
  .pipe concat "vendors.js"
  .pipe sourcemaps.write()
  .pipe gulp.dest config.paths.build

gulp.task "javascript:compile", ["javascript:compile:vendors"], ->
  gulp
    .src [
      "#{config.paths.build}/vendors.js"
      "app/**/*.js"
    ]
    .pipe sourcemaps.init()
    .pipe annotate()
    .pipe concat "app.js"

    # Replaces ${ENV:VARNAME} pattern with VARNAME environment var
    .pipe replace /\$\{ENV:(\b.*\b)\}/g, (match, varname)->
      return process.env[varname] or ''

    .pipe uglify()
    .pipe sourcemaps.write()
    .pipe gulp.dest config.paths.target
    .pipe gulpif env is "development", refresh lr


# Copy assets
# =====================================
gulp.task "copy:assets", ["bower"], ->
  gulp
    .src [
      "app/assets/**/*.*"
      "#{config.paths.build}/**/fonts/*.*"
    ]
    .pipe rename (path)->
      path.dirname = "fonts" if /(.*)\/fonts/.test path.dirname
      path
    .pipe gulpif env is "development"
      , gulpif /index\.html/, embedlr port: liveReloadPort, refresh lr
    .pipe gulp.dest config.paths.target
    .pipe gulpif env is "development", refresh lr


# Watch for modifications
# =======================
gulp.task "watch", ["server"], ->
  gulp.watch ["app/**/*.less"],                 ["less:compile"]
  gulp.watch ["app/**/*.js"],                   ["javascript:compile"]
  gulp.watch ["app/assets/**/*.*"],             ["copy:assets"]

# Start server
# =======================
gulp.task "server", ["build"], (done)->
  {server} = require "./index"

  server
    .then (app)->
      app.use livereload port: liveReloadPort
      app.listen port
      lr.listen liveReloadPort
    .done ->
      done()


# Cleaning
# ========
gulp.task "clean", (done)->
  del (value for key, value of config.paths), done


# Build task
# ===============
gulp.task "build", [
    "less:compile"
    "javascript:compile"
    "copy:assets"
  ], (done)->

  if env is "production"
    del (value for key, value of config.paths), done
  else
    done()

# Default task
# ============
gulp.task "default", ["build"]
