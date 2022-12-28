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
            // $("#ws-status").html("Connected");
            // $("#ws-status").css("background-color", "#afa");
            // $("#server_light").val("ON");
            $("#signal").html("READY");
            $("#ws-status").html("Connected");
            $("#ws-status").css("background-color", "#afa");
            console.log("ws.onopen", evt);

            confWin = new confirmWindow({
              ws:ws
            });

            makeStudentPage(ws);

        };

        ws.onmessage = function(evt) {
            //console.log(evt);
            var sData = JSON.parse(evt.data);
            //console.log(sData);

            //WHAT TO DO WHEN WE GET A MESSAGE FROM THE SERVER
            if (sData.info == 'sign in'){
              //window.alert(sData.msg);
              let mw = new messageWindow({ws:ws, msg:sData.msg});
            }
            if (sData.info == 'studentSignInHistory'){
              let stu = students.getById(sData.studentId);
              stu.outputCalendar({
                    loginTimes: sData.msg,
                    targetDiv: "studentCalendar"
                  });
              //stu.outputTable(sData.msg, false);

            }

            if (sData.info == 'checkout'){
              let mw = new messageWindow({ws:ws, msg:sData.msg});
            }

            if (sData.info == 'lastStatus'){
              data = JSON.parse(sData.msg);
              //console.log("lastStatus Data: ", data);
              //let db = itemDBs[sData.itemType];
              //populate info divs
              populateItemStatus(data);
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

        $("#timer").click(function(){
            let m = $("#timerMin").val();
            let s = $("#timerSec").val();
            let msg = '{"what": "timer", "minutes":'+ m + ', "seconds": '+ s + '}';
            ws.send(msg);
        });

        $("#reboot").click(function(){
            let check = confirm("Reboot Pi?");
            if (check){
              var msg = '{"what": "reboot"}';
              ws.send(msg);
            }
        });



      });
