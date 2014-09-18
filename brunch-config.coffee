exports.config =
  modules:
    definition: false
    wrapper:    false

  files:
    javascripts:
      joinTo:
        'app.js'

    stylesheets:
      joinTo:
        'app.css'    : /app\/less\/app\.less/

  sourceMaps: true

  server:
    path: 'index.js'
