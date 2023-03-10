const fs = require('fs');
const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const crypto = require('crypto');
const FileStore = require('session-file-store')(session); // 세션을 파일에 저장
const cookieParser = require('cookie-parser');
const post = require('./router/routs')
app.use('/post_pa')


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

app.post('/login.ejs',(req,res)=>{
    const body = req.body;
    const id = body.id;
    const pw = body.pw;
    console.log(id);
        client.query('select * from duduhgeedb.users where id=?',[id],(err,data)=>{
        // 로그인 확인
        //console.log(data[0]);
        //console.log(id);
        //console.log(data[0].id);
        //console.log(data[0].pw);
        //console.log(id == data[0].id);
        //console.log(pw == data[0].pw);
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

app.get('/register',(req,res)=>{
    console.log('회원가입 페이지');
    res.render('register');
});

app.post('/register',(req,res)=>{
    console.log('회원가입 하는중')
    const body = req.body;
    const id = body.id;
    const pw = body.pw;
    const name = body.name;
    //const age = body.age;

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
});

// 로그아웃
app.get('/logout',(req,res)=>{
    console.log('로그아웃 성공');
    req.session.destroy(function(err){
        // 세션 파괴후 할 것들
        res.redirect('/');
    });

});
app.listen(3000,()=>{
    console.log('3000 port running...');
});