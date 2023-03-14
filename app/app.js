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
var ip=require('ip');
var https=require('https');
const saltRounds=10;
const option = {
    key: fs.readFileSync('key.pem', 'utf8'),
    cert: fs.readFileSync('cert.pem', 'utf8'),
    passphrase:'230310'
}

// express 설정 1
const app = express();

// db 연결 2
const client = mysql.createConnection({
    user : 'root',
    password : '@Rkddbals0217',
    database : 'duduhgeedb'
});

// 정적 파일 설정 (미들웨어) 3
app.use(express.static(path.join(__dirname,'/public')));

// ejs 설정 4
app.set('views', __dirname + '\\views');
app.set('view engine','ejs');

// 정제 (미들웨어) 5
app.use(bodyParser.json()); //json으로 파싱
app.use(bodyParser.urlencoded({extended:false}));

// 세션 (미들웨어) 6
app.use(session({
    secret: 'blackzat', // 데이터를 암호화 하기 위해 필요한 옵션
    resave: false, // 요청이 왔을때 세션을 수정하지 않더라도 다시 저장소에 저장되도록
    saveUninitialized: true, // 세션이 필요하면 세션을 실행시칸다(서버에 부담을 줄이기 위해)
    store : new FileStore() // 세션이 데이터를 저장하는 곳
}));

// 메인페이지
app.get('/',(req,res)=>{
    //console.log('메인페이지 작동');
    //console.log(req.session);
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


// 로그인
app.get('/login.ejs',(req,res)=>{
    console.log('로그인 작동');
    res.render('login.ejs');
});

/* 내가 만든 로그인
app.post('/login',(req,res)=>{
    const body = req.body;
    const id = body.id;
    const pw = body.pw;
    console.log(id);
        client.query('select * from duduhgeedb.users where id=?',[id],(err,data)=>{
        
        if(id == data[0].id || pw == data[0].pw){
            console.log('로그인 성공');
            
            
            // 세션에 추가
            req.session.is_logined = true;
            req.session.name = data.name;
            req.session.id = data.id;
            req.session.pw = data.pw;
            req.session.save(function(){ // 세션 스토어에 적용하는 작업
                res.render('index',{ // 정보전달
                    name : data[0].name,
                    id : data[0].id,
                    is_logined : true
                });
            });
        }else{
            console.log('로그인 실패');
            res.render('login.ejs');
        }
    });
    
});
*/
app.post('/login', (request, response) => {	
    console.log('로그인 진행중');
    var username = request.body.loginid;
    var password = request.body.password;
    if (username && password) {             // id와 pw가 입력되었는지 확인
        console.log('id와 pw가 받아졌음');
        client.query('SELECT * FROM duduhgeedb.users WHERE id = ? AND password = ?', [username, password], function(error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {       // db에서의 반환값이 있으면 로그인 성공
                response.send('성공');  
                request.session.is_logined = true;
                //request.session.name = username;
                request.session.id = username;
                request.session.pw = password;
                request.session.save(function(){ // 세션 스토어에 적용하는 작업
                    response.render('index',{ // 정보전달
                    
                        id : username,
                        pw : password,
                        is_logined : true
                    });
            });
            } else {              
                response.send('로그인정보 일치 안함');    
            }            
        });
    } else {
        response.send('다시');    
    }
  });


  app.get('/register.ejs',(req,res)=>{
    console.log('회원가입 페이지');
    res.render('register.ejs');
});
app.post('/register',(request,response)=>{
    console.log('회원가입 하는중')
    const body = request.body;
    const id = body.loginid;
    const password = body.password;
    const name = body.name;

    /* 내가 만든 회원가입
    client.query('select * from duduhgeedb.users where id=?',[id],(err,data)=>{
        if(data.length == 0){
            i=0;
            console.log('회원가입 성공');
            client.query('insert into users(id, pw, name) values(?,?,?)',[
                id, pw , i
            ]);
            i++;
            res.redirect('/');
        }else{
            console.log('회원가입 실패');
            res.send('<script>alert("회원가입 실패");</script>')
            res.redirect('/login.ejs');
        }
    });
    */
    if (name && id && password) {
        console.log('회원가입 id와 pw가 받아졌음');
        client.query('SELECT * FROM duduhgeedb.users WHERE id = ?', [id], function(error, results, fields) { // DB에 같은 이름의 회원아이디가 있는지 확인
            if (error) throw error;
            if (results.length <= 0) {     // DB에 같은 이름의 회원아이디가 없는 경우 
                const param=[id, password, name];
                bcrypt.hash(param[1], saltRounds, (error, hash)=>{
                    param[1]=hash;
                    
                    client.query('INSERT INTO users (id, password, name) VALUES(?,?,?)', [id, password,name], function (error, data) {
                        if (error) throw error;
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

// 로그아웃
app.get('/logout',(req,res)=>{
    console.log('로그아웃 성공');
    req.session.destroy(function(err){
        // 세션 파괴후 할 것들
        res.redirect('/');
    });

});

https.createServer(option, app).listen(3000, function(){
    console.log('https://'+ip.address() + ':' + 3000+ " | start time : "+new Date());
});
/*
app.listen(3000,()=>{
    console.log('3000 port running...');
});
*/