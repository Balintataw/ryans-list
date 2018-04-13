const mysql = require('mysql')
const config = require('config')

var connection = mysql.createConnection({
    host : config.get('db.hostname'),
    user : config.get('db.user'),
    password : config.get('db.password'),
    database : config.get('db.database')
})

connection.connect()

module.exports = connection