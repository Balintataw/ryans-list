const express = require('express')
const router = express.Router()
const conn = require('../lib/conn')
const sha512 = require('js-sha512')
const auth = require('../middlewares/auth')

router.get('/account', auth, (req, res, next) => {
    console.log(req.session)
    let sql = `
        SELECT * FROM listings WHERE created_by = ?
    `
    conn.query(sql, [req.session.user], (err, results, fields) => {
        console.log(results)
        res.render('account', {user: req.session.user, results})
    })
})
router.get('/login', (req, res, next) => {
    var data = {
        title: 'Login'
    }
    if (req.query.error) {
        data.error = "Something did not match"
    }
    res.render('login', data)
})

router.post('/login', (req, res, next) => {
    const username = req.body.username
    const password = req.body.password
    const sql = `SELECT username, password FROM users WHERE username = ?`
    conn.query(sql, [username], (err, results, fields) => {
        const chkname = results[0].username
        const chksum = results[0].password
        if ( sha512(password) !== chksum || username !== chkname) {
            res.redirect('/login?error=true')
        } else {
            const sql2 = `
            SELECT count(1) FROM users WHERE username = ? and password = ?
            `
            conn.query(sql2, [username, sha512(password)], (err2, results2, fields2) => {
                if (results2.length > 0) {
                    req.session.authenticated = true
                    req.session.user = username
                    res.redirect('/')
                } else {
                    res.redirect('/login?error=true')
                }
            })
        }
    })
})

router.post('/register', (req, res, next) => {
    console.log(req.body)
    const username = req.body.username
    const password = req.body.password
    const confirm = req.body.confirmpassword
    if (password !== confirm || password === '' || username === '') {
        res.redirect('/login?error=true')
    } else {
        const sql = `
        INSERT INTO users (username, password) VALUES (?, ?)
        `
        conn.query(sql, [username, sha512(password)], (err, results, fields) => {
            req.session.authenticated = true
            req.session.user = username
            res.redirect('/')
        })
    }
})

router.post('/logout', (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/login')
    })
})


module.exports = router