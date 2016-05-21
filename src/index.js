'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.use('/static', express.static(__dirname + '/public'));

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

//CHANGE LATER, HERE FOR C9
var port = process.env.PORT;
http.listen(port,function(){
    console.log("The process is running on port:"+port);
});

//HOME ROUTE--
//      Should be what the user sees when they first arrive on the website
app.get("/",function(req,res){
    res.locals.onGame = false;
    res.render("home.jade");
});

//GAME ROUTE--
//      Should render the game for the user to play
app.get("/game",function(req,res){
    res.locals.onGame = true;
    res.render("game.jade");
    
    //SOCKET IO CONNECTION HANDLING
    io.on('connection', function(socket){
        console.log(socket.id);
    });
});

