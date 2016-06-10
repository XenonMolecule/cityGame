'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//SETUP FILE SYSTEM INTERACTIONS
var fs = require('fs');

var gameCodes = [];

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
    res.locals.host = false;
    res.render("home.jade");
    initSocketIO();
});

//HOST ROUTE--
//      Should render the game for the user to play
app.get("/host",function(req,res){
    res.locals.onGame = true;
    res.locals.host = true;
    res.render("host.jade");
    initSocketIO();
});

//JOIN ROUTE--
//      Should allow a player to join the game
app.get("/join",function(req,res){
    res.locals.onGame = true;
    res.locals.host = false;
    res.render("join.jade");
    initSocketIO();
});

app.get("/home",function(req,res){
    res.locals.onGame = false;
    res.locals.host = false;
    res.render("home.jade");
});

//SOCKET IO CONNECTION HANDLING
function initSocketIO(){
    io.on('connection', function(socket){
        console.log(socket.id);
        socket.on('join',function(id){
            var data = {id:id,serverID:socket.id}
            io.emit('join',data);
        });
        socket.on('successfulPair',function(id){
            id.serverID = socket.id;
            io.emit('successfulPair',id);
        });
        socket.on('giveID',function(data){
            data.partnerID = socket.id;
            io.emit('giveID',data); 
        });
        socket.on('newGameCode',function(data){
            console.log(data);
            var successCount = 0;
            for(var i = 0; i < gameCodes.length; i ++){
                if(gameCodes[i] == data){
                    socket.emit('failedCode',data);
                    break;
                } else {
                    successCount++;
                }
            }
            if(successCount == gameCodes.length){
                socket.emit('successfulCode',data);
                gameCodes.push(data);
            }
        });
        socket.on('prepGame',function(destination){
            io.emit('prepGame',destination);
        });
        socket.on('moved',function(data){
            io.emit('moved',data); 
        });
        socket.on('win',function(data){
            io.emit('win',data); 
        });
        socket.on('newProfileImage',function(data){
            console.log("New Profile Image");
            fs.writeFile('./public/images/players/'+data.user+'.txt',data.image,function(err){
                if(err!=null){
                    console.log(err);
                } else {
                    console.log("updated "+data.user+"'s profile picture");
                }
            });
        });
        //TEST
        socket.on('test',function(){
            io.emit('test',gameCodes);
        });
    });
}