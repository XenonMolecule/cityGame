var gameCode,gameStarted = false,partner,serverID;

$(".beginGame").on("click",function(){
    if($(".code").val()!=""){
        gameCode = $(".code").val();
        socket.emit('join',$(".code").val());
    }
});


socket.on('successfulPair',function(id){
    if(gameCode!=undefined&&gameStarted==false){
        serverID = id.yourID;
        partner = id.serverID;
        var data = {id:gameCode,yourID:partner}
        socket.emit('giveID',data);
        $(".joinGame").fadeOut(500,function(){
            $(".wait").fadeIn(500);
        });
    }
});
