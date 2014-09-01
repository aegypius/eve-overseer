module.exports = {
  ensureAuthenticated: (req, res, next)->
    return next() if req.isAuthenticated()
    res.status 401
    res.end()
}
