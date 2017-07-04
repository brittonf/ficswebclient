/*
#define BLK_ABORT 10
#define BLK_ACCEPT 11
#define BLK_DECLINE 33
#define BLK_DRAW 34
#define BLK_GAMES 43
#define BLK_MATCH 73
#define BLK_MOVES 77
#define BLK_OBSERVE 80
#define BLK_PENDING 87
#define BLK_RESIGN 103
#define BLK_SEEK 155
#define BLK_SOUGHT 157
#define BLK_UNOBSERVE 138
#define BLK_UNSEEK 156
#define BLK_WITHDRAW 147
*/

var ficswrap = io();

ficswrap.on("logged_in", function(msg) {
    $('#login_div').hide();
    $('#shellout').show();
    $('#shellin').show();
    $('#games').prop('hidden', false);
    $('#sought').prop('hidden', false);
    $('#match').prop('hidden', false);
    $('#seek').prop('hidden', false);
    $('#resizer').prop('hidden', false);
});

ficswrap.on("result", function(msg) {
    let ficsobj = window.FICSPARSER.parse(msg);
    let showout = false;
    
    if (ficsobj.cmd_code) {
        cmd_code = ficsobj.cmd_code;
        console.log('cmd_code: ' + cmd_code);
        if (ficsobj.end_reached) {
            console.log('ficsobj.endreached');
            // games command result
            if (ficsobj.cmd_code === 43) {
                renderGameList(ficsobj.body.split('\n'));

            // sought command result
            } else if (ficsobj.cmd_code === 157) {
                renderSoughtList(ficsobj.body.split('\n'));

            // moves command result
            } else if (ficsobj.cmd_code === 77) {
                var movesobj = window.MOVESPARSER.parse(ficsobj.body);
                var game_num = movesobj.get("game_num");
                var game = gamemap.get(game_num);

                if (game) {
                    var moves = movesobj.get("moves");
                    var movetimes = movesobj.get("movetimes");

                    for (var i=0; i<moves.length; i++) {
                        game.chess.move(moves[i]);
                        game.fens[i] = game.chess.fen();
                        game.movetimes[i] = movetimes[i];
                    }

                    game.current_move_index = game.chess.history().length - 1;

                    renderGame(game_num);
                    renderMoveList(game_num, moves);
                }

            // observe command result
            } else if (ficsobj.cmd_code === 80) {
                //showout = true;
                var game_num = ficsobj.s12.game_num;
                gamemap.set(game_num, new Game(ficsobj.s12));


                ficswrap.emit('command', 'moves ' + game_num);
            } 
            
        }
    }

    showout = true;
    console.log('cmd_code is ' + ficsobj.cmd_code + ', here is body, parse it');
    //var bodyobj = window.BODYPARSER.parse(ficsobj.body);
    console.log(ficsobj.body);
    console.log('end body log');
    
    if (ficsobj.style12) {
        console.log('ficsobj.style12 received');
        let game_num = ficsobj.s12.game_num;
        let game = gamemap.get(game_num);


        //console.log('\n\n\nGame # ' + game_num + ' - Begin Move:\n');
        //console.log('ficsobj.s12 is');
        //console.log(ficsobj.s12);
        //console.log(game.chess.history().length + '  ' + getMoveIndexFromS12(ficsobj.s12));
        //console.log(game.chess.history());
        //console.log(ficsobj.s12);
        //console.log(ficsobj.style12);


        if (game.chess.history().length != getMoveIndexFromS12(ficsobj.s12)) {
            //console.log('xxxxxxxxxxxxxxxxxx  -- something wrong, calling moves');
            ficswrap.emit('command', 'moves '+game_num);
        } else {
            //console.log('ficsobj.s12.move_note_short is: ' + ficsobj.s12.move_note_short);
            var new_move_index = game.chess.history().length;
            
            var move_info = game.chess.move(ficsobj.s12.move_note_short, {sloppy:true});
            if (move_info) {
                game.s12 = ficsobj.s12;
                game.movetimes[new_move_index] = ficsobj.s12.move_time;
                game.fens[new_move_index] = game.chess.fen().split(' ')[0];
                appendToMoveList(game_num, new_move_index);
                if (game.current_move_index == new_move_index - 1) {
                    goToMove(game_num, new_move_index, animate=true);
                }
                runClock(game_num);
            }
        }



        //console.log('game.chess.history().length :  ' + game.chess.history().length);
        //console.log(game.chess.history());
        //console.log('game.fens.length :  ' + game.fens.length);
        //console.log(game.fens);
        //console.log('game.movetimes.length :  ' + game.movetimes.length);
        //console.log(game.movetimes);

        showout = false;

        console.log('DONE WITH RESULT HANDLE');
    }


    if (ficsobj.body.length && showout) 
    {
        $('<pre>' + ficsobj.body + '</pre>').appendTo($('#shellout'));
        $('#shellout').scrollTop($('#shellout').prop('scrollHeight'));
    }
});


