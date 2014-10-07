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

lr         = (require "tiny-lr")()
refresh    = require "gulp-livereload"
livereload = require "connect-livereload"
embedlr    = require "gulp-embedlr"

env            = process.env.NODE_ENV        or "development"
port           = process.env.PORT            or 3333
liveReloadPort = process.env.LIVERELOAD_PORT or 35729


# Export main files from bower components
# =======================================
gulp.task "bower", ->
  gulp
    .src bowerfiles(), base: 'bower_components'
    .pipe gulp.dest "public/lib"


# Configure and compiles less files
# =================================
gulp.task "less:configure", ["bower"],  ->
  gulp
    .src [
      "app/**/variables.less"
      "app/**/theme.less"
    ]
    .pipe gulp.dest "public/lib/bootstrap"

gulp.task "less:compile", ["less:configure"],  ->
  gulp
    .src [
      "public/lib/bootstrap/less/bootstrap.less"
      "public/lib/fontawesome/less/fontawesome.less"
      "public/lib/bootstrap/less/theme.less"
    ]
    .pipe sourcemaps.init()
    .pipe concat "app.less"
    .pipe less()
    .pipe sourcemaps.write "./"
    .pipe gulp.dest "public/"
    .pipe gulpif env is "development", refresh lr


# Configure and compiles javascripts files
# ========================================
gulp.task "javascript:compile", ["bower"], ->
  gulp
    .src [
      "public/lib/**/*.js"
      "!public/lib/**/*.min.js"
      "app/**/*.js"
    ]
    .pipe sourcemaps.init()
    .pipe annotate()
    .pipe concat "app.js"
    .pipe uglify()
    .pipe sourcemaps.write "./"
    .pipe gulp.dest "public/"
    .pipe gulpif env is "development", refresh lr


# Copy assets
# =====================================
gulp.task "copy:assets", ["bower"], ->
  gulp
    .src [
      "app/assets/**/*.*"
      "public/lib/**/fonts/*.*"
    ]
    .pipe rename (path)->
      path.dirname = "fonts" if /(.*)\/fonts/.test path.dirname
      path
    .pipe gulpif env is "development"
      , gulpif /index\.html/, embedlr port: liveReloadPort, refresh lr
    .pipe gulp.dest "public/"


# Watch for modifications
# =======================
gulp.task "watch", ["server"], ->
  gulp.watch ["app/**/*.less"],     ["less:compile"]
  gulp.watch ["app/**/*.js"],       ["javascript:compile"]
  gulp.watch ["app/assets/**/*.*"], ["copy:assets"]


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
  del ["public"], done


# Build task
# ===============
gulp.task "build", [
    "less:compile"
    "javascript:compile"
    "copy:assets"
  ], (done)->

  if env is "production"
    del ["public/lib"], done
  else
    done()



# Default task
# ============
gulp.task "default", ["build"]
