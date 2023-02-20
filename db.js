//mysql에 접속하기 위한 정보를 담고있는 db.js
var mysql = require('mysql');
var db = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: 'hieugine01T!',
    database: 'Users'
});
db.connect();

module.exports = db;