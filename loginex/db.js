var mysql = require('mysql');
var db = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: 'pw',
    database: 'Users'
});
db.connect();

module.exports = db;