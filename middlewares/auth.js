module.exports = (req, res, next) => {
    console.log(req.session)
    if (req.session.authenticated) {
        // var hour = 3600000
        // req.session.cookie.expires = new Date(Date.now() + hour)
        req.session.cookie.expires = false
        // req.session.cookie.maxAge = hour
        next()
    } else {
        res.redirect('/login')
    }
}