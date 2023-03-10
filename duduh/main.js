const fs = require('fs');
const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const crypto = require('crypto');
const FileStore = require('session-file-store')(session); // 세션을 파일에 저장
const cookieParser = require('cookie-parser');

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


// 회원가입
// app.get('/register',(req,res)=>{
//     console.log('회원가입 페이지');
//     res.render('register');
// });

// app.post('/register',(req,res)=>{
//     console.log('회원가입 하는중')
//     const body = req.body;
//     const id = body.id;
//     const pw = body.pw;
//     const name = body.name;
//     const age = body.age;

//     client.query('select * from userdata where id=?',[id],(err,data)=>{
//         if(data.length == 0){
//             console.log('회원가입 성공');
//             client.query('insert into userdata(id, name, age, pw) values(?,?,?,?)',[
//                 id, name, age, pw
//             ]);
//             res.redirect('/');
//         }else{
//             console.log('회원가입 실패');
//             res.send('<script>alert("회원가입 실패");</script>')
//             res.redirect('/login');
//         }
//     });
// });

app.listen(3000,()=>{
    console.log('3000 port running...');
});
