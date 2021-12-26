const { Router } = require('express');
const authLogin = new Router();

authLogin.get("/login", (req, res) => {
    const user = req.session?.login
    if (user) {
        res.redirect('/productos', {login: req.session.login})
    } else {
        res.render('login')
    }
})

authLogin.post("/login", (req, res) => {
    req.session.login = req.body.login;
    console.log(req.body.login);
    res.redirect("/productos")
    // res.send(req.body.login)
})

authLogin.get("/logout", (req, res) => {
    res.render("logout")
    // redirect a /login o /productos
})

module.exports = authLogin;