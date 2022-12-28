$(document).ready(function(){

        var WEBSOCKET_ROUTE = "/ws";

        if(window.location.protocol == "http:"){
            //localhost
            var ws = new WebSocket("ws://" + window.location.host + WEBSOCKET_ROUTE);
        }
        else if(window.location.protocol == "https:"){
            //Dataplicity
            var ws = new WebSocket("wss://" + window.location.host + WEBSOCKET_ROUTE);
        }

        ws.onopen = function(evt) {
            $("#signal").html("READY");
            $("#ws-status").html("Connected");
            $("#ws-status").css("background-color", "#afa");
            console.log("ws.onopen", evt);

            confWin = new confirmWindow({
              ws:ws
            });

            


        };

        ws.onmessage = function(evt) {
            //console.log(evt);
            var sData = JSON.parse(evt.data);
            console.log('sData:', sData);

            //WHAT TO DO WHEN WE GET A MESSAGE FROM THE SERVER
            if (sData.info == 'sign in'){
              //window.alert(sData.msg);
              let mw = new messageWindow({ws:ws, msg:sData.msg});
            }


        };

        ws.onclose = function(evt) {
            $("#ws-status").html("Disconnected");
            $("#ws-status").css("background-color", "#faa");
            $("#server_light").val("OFF");
        };

        //MESSAGES TO SEND TO THE SERVER

        $("#hello").click(function(){
            let msg = '{"what": "hello"}';
            ws.send(msg);
        });




      });
