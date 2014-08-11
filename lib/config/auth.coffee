module.exports = {
  ensureAuthenticated: (req, res, next)->
    return next() if res.isAuthenticated()
    res.status 401
}
