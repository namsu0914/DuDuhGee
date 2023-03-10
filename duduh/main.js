const fs = require('fs');
const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const crypto = require('crypto');
const FileStore = require('session-file-store')(session); // 세션을 파일에 저장
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const saltRounds=10;

// express 설정 1
const app = express();

// db 연결 2
const client = mysql.createConnection({
    host: '127.0.0.1',   //수정함 0306
    port: '3306',
    user : 'root',
    password : 'hieugine01T!',
    database : 'Users'
});

// 정적 파일 설정 (미들웨어) 3
app.use(express.static(path.join(__dirname,'/public')));

// ejs 설정 4
app.set('views', __dirname + '//views');
app.set('view engine','ejs');

// 정제 (미들웨어) 5
app.use(bodyParser.urlencoded({extended:true}));

// 세션 (미들웨어) 6
app.use(session({
    secret: 'blackzat', // 데이터를 암호화 하기 위해 필요한 옵션
    resave: false, // 요청이 왔을때 세션을 수정하지 않더라도 다시 저장소에 저장되도록
    saveUninitialized: true, // 세션이 필요하면 세션을 실행시칸다(서버에 부담을 줄이기 위해)
    store : new FileStore() // 세션이 데이터를 저장하는 곳
}));

app.get('/',(req,res)=>{
    console.log('메인페이지 작동');
    console.log(req.session);
    if(req.session.is_logined == true){
        res.render('index',{
            is_logined : req.session.is_logined,
            name : req.session.name
        });
    }else{
        res.render('index',{
            is_logined : false
        });
    }
});

//로그인
app.get('/login.ejs', function(req, res){
    console.log('로그인 작동');
    res.render('login.ejs'); // ejs(html)파일 보여줄 때 이렇게 render() 사용
});

app.post('/login', (request, response) => {	
    console.log('로그인 진행중');
    var username = request.body.loginid;
    var password = request.body.password;
    if (username && password) {             // id와 pw가 입력되었는지 확인
        console.log('id와 pw가 받아졌음');
        client.query('SELECT * FROM Users.users WHERE id = ? AND password = ?', [username, password], function(error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {       // db에서의 반환값이 있으면 로그인 성공
                response.send(`성공`);  
            } else {              
                response.send(`로그인정보 일치 안함`);    
            }            
        });
    } else {
        response.send(`다시`);    
    }
  });

//회원가입
app.get('/register.ejs',(req,res)=>{
    console.log('회원가입 페이지');
    res.render('register.ejs');
});
app.post('/register',(request,response)=>{    
    console.log('회원가입 진행중');
    var username = request.body.name;
    var userid = request.body.loginid;
    var password = request.body.password;    

    if (username && userid && password) {
        console.log('회원가입 id와 pw가 받아졌음');
        client.query('SELECT * FROM Users.users WHERE id = ?', [userid], function(error, results, fields) { // DB에 같은 이름의 회원아이디가 있는지 확인
            if (error) throw error;
            if (results.length <= 0) {     // DB에 같은 이름의 회원아이디가 없는 경우 
                const param=[userid, password, username];
                bcrypt.hash(param[1], saltRounds, (error, hash)=>{
                    param[1]=hash;
                    client.query('INSERT INTO users (id, password, name) VALUES(?,?,?)', [userid, password, username], function (error, data) {
                        if (error) throw error2;
                        response.send(`회원가입이 완료되었습니다.`);
                    });
                });
                // 아래는 암호화 적용 안하는 코드
                // client.query('INSERT INTO users (id, password, name) VALUES(?,?,?)', [userid, password, username], function (error, data) {
                //     console.log('됐나');
                //     if (error) throw error2;
                //     response.send(`회원가입이 완료되었습니다.`);
                // });
            } else {                                                  // DB에 같은 이름의 회원아이디가 있는 경우
                response.send(`이미 존재하는 회원 아이디입니다.`);    
            }            
        });
    } else {        // 입력되지 않은 정보가 있는 경우
        response.send(`입력하지 않은 칸이 있습니다.`);
    }
});

app.listen(3000,()=>{
    console.log('3000 port running...');
});
