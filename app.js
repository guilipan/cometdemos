
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

//长轮询
app.get("/longpolling",function(req,res,next){
    res.render("longpolling", { title: 'Express' });
})
app.get("/comet/longpolling",function(req,res,next){
    //每3秒输出数据
    setTimeout(function(){
        res.send("data is coming");
    },3000)
})

//永久帧
app.get("/foreverframe",function(req,res,next){
    res.render("foreverframe", { title: 'Express' });
})

app.get("/comet/foreverframe",function(req,res,next){
    var callback=req.query["callback"];
    setInterval(function(){
        res.write("<script>"+callback+"('data is coming');</script>")
    },3000)
})

//xhr流
app.get("/xhrstream",function(req,res,next){
    res.render("xhrstream", { title: 'Express' });
})

app.get("/comet/xhrstream",function(req,res,next){
    for(var i=0;i<1000;i++){
        res.write(i.toString()+"\r\n data is coming!");
    }
    res.end("ended");
})

//socket.io
app.get("/chat",function(req,res,next){
    res.render("socket-io",{ title: 'Express' })
})

var server=http.createServer(app),
    io=require("socket.io").listen(server);
    server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

    var chat=io
    .of("/chat")
    .on('connection', function (socket) {
    socket.broadcast.emit('user connected',"wefef");
    socket.on("chat",function(data){
        console.log(data)
    })
    socket.on("leavemessage",function(data){
        socket.broadcast.emit('broadcast',data)
    })
});
