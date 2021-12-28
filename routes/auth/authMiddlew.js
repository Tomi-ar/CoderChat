const session = require("express-session")

function webAuth(req, res, next) {
    if (req.session?.login) {
        return next();
    }
    res.redirect('/login');
}

module.exports = webAuth;