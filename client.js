/*
 *
 * GLOBALIA
 *
 */


const m = require('mithril');

const SOCK = io();

const ROOT = document.body;

const DEFAULT_THEMES = [
    {"name":"cop","light_rgba":{"r":255,"g":255,"b":255,"a":0.09},"dark_rgba":{"r":255,"g":255,"b":255,"a":0},"texture":"brushed-copper.jpg","white_pieces":"alpha","black_pieces":"alpha"},
    {"name":"fire","dark_rgba":{"r":0,"g":0,"b":0,"a":0.74},"light_rgba":{"r":253.57,"g":132.59,"b":33.14,"a":0.72},"texture":"Fire-Flames-Background-11-625x468.jpg","white_pieces":"chesscom","black_pieces":"chesscom"},
    {"name":"hunjies","dark_rgba":{"r":48.43,"g":101.82,"b":21.71,"a":0.81},"light_rgba":{"r":245.46,"g":244.67,"b":241.70,"a":0.79},"texture":"Money-Background-17-625x625.jpg","white_pieces":"uscf","black_pieces":"uscf"},
    {"name":"leaves","dark_rgba":{"r":0,"g":0,"b":0,"a":0.71},"light_rgba":{"r":255,"g":255,"b":255,"a":0.56},"texture":"Nature-Leaves-Background-70-625x500.jpg","white_pieces":"chesscom","black_pieces":"chess24"},
    {"name":"medieval","dark_rgba":{"r":0,"g":0,"b":0,"a":0.55},"light_rgba":{"r":243.98,"g":228.07,"b":195.99,"a":0.64},"texture":"kentmap.jpg","white_pieces":"leipzig","black_pieces":"leipzig"},
    {"name":"metal","dark_rgba":{"r":0,"g":0,"b":0,"a":0},"light_rgba":{"r":226.63,"g":250.002,"b":54.77,"a":0.46},"texture":"metal-plate-texture_1048-2443.jpg","white_pieces":"chesscom_wood","black_pieces":"chesscom"},
    {"name":"royal","dark_rgba":{"r":116.17,"g":38.98,"b":255,"a":0.71},"light_rgba":{"r":242.47,"g":205.57,"b":65.49,"a":0.55},"texture":"Money-Background-19-625x468.jpg","white_pieces":"wikipedia","black_pieces":"alpha"},
    {"name":"stone","dark_rgba":{"r":145.60,"g":2.82,"b":2.82,"a":0.372},"light_rgba":{"r":255,"g":200.7105,"b":200.7105,"a":0.47},"texture":"Stone-Tiles-Background-22-625x625.jpg","white_pieces":"symbol","black_pieces":"chess24"},
    {"name":"warroom","dark_rgba":{"r":0,"g":0,"b":0,"a":0.6},"light_rgba":{"r":46.42,"g":254.39,"b":0,"a":0.63},"texture":"design_digital_map3.jpg","white_pieces":"chesscom","black_pieces":"chess24"},
    {"name":"wawa","dark_rgba":{"r":2.847,"g":0,"b":255,"a":0.43},"light_rgba":{"r":239.01,"g":235.93,"b":224.24,"a":0.07},"texture":"blue-rippled-water-background-in-swimming-pool_1373-193.jpg","white_pieces":"uscf","black_pieces":"chess24"},
    {"name":"wood","dark_rgba":{"r":91.31,"g":28.09,"b":28.09,"a":0.75},"light_rgba":{"r":176.12,"g":238.45,"b":103.1,"a":0.2},"texture":"antique-wooden-planks-texture_1232-824.jpg","white_pieces":"chesscom","black_pieces":"alpha"}]

var g_soundmap = {
    ambience: [],
    gong: [],
    moves: [],
    captures: [],
    checks: []
};

var g_themes;
var g_user = '';
var g_players = [];
var g_theme_nums = 0;
var g_in_menu = false;

const NAV_HEIGHT_SHARE = .04;
const PLAYER_HEIGHT_SHARE = .04;
const SPACE_HEIGHT_SHARE = .01;
const INFO_MIN_HEIGHT_SHARE = .09;
const BOARD_MAX_HEIGHT_SHARE = 1 - (NAV_HEIGHT_SHARE * 2) - (PLAYER_HEIGHT_SHARE * 2) - (SPACE_HEIGHT_SHARE * 2) - (INFO_MIN_HEIGHT_SHARE * 2);




/*
 *
 * GLOBAL FUNCS
 *
 */


function strip(s) { return s.replace(/^\s*/, '').replace(/\s*$/, '') }

function calcDims() {
    var w = $(window).width();
    var h = $(window).height();

    var board_height_share = w/h;
    if ( board_height_share > BOARD_MAX_HEIGHT_SHARE ) {
        board_height_share = BOARD_MAX_HEIGHT_SHARE;
    }
    var info_height_share = (1 - (2 * NAV_HEIGHT_SHARE) - (2 * PLAYER_HEIGHT_SHARE) - (2 * SPACE_HEIGHT_SHARE) - board_height_share) / 2;
    
    var nav_height = h * NAV_HEIGHT_SHARE;
    var player_height = h * PLAYER_HEIGHT_SHARE;
    var space_height = h * SPACE_HEIGHT_SHARE;
    var info_height = h * info_height_share;
    var board_height = h * board_height_share;
    var board_width = w > board_height ? board_height : w;
    board_width = board_width * .98;

    var nav_offset = 0;
    var info_offset = nav_height;
    var player_offset = info_offset + info_height;
    var space_offset = player_offset + player_height;
    var board_offset = space_offset + space_height;


    $('.nav_container').css('line-height', nav_height +'px');
    $('.evenly_spaced').css('font-size', (nav_height * .6) +'px');

    $('#centerer').css('height', (player_height*2 + space_height*2 + board_height + info_height*2) +'px');
    $('#centerer').css('width', board_width+'px');
    $('#centerer').css('top', info_offset+'px');

    $('.lists').css('height', (h - 2*nav_height) + 'px');
    $('.lists').css('top', info_offset+'px');

    $('#top_nav').css('height', nav_height+'px');
    $('#top_nav').css('top', nav_offset+'px');
    
    $('.top_info').css('height', info_height+'px');
    $('.top_info').css('top', info_offset+'px');
    $('.top_info').css('width', board_width+'px');
    
    $('.top_player').css('height', player_height+'px');
    $('.top_player').css('top', player_offset+'px');
    $('.top_player').css('width', board_width+'px');
    
    $('.top_space').css('height', space_height+'px');
    $('.top_space').css('top', space_offset+'px');
    $('.top_space').css('width', board_width+'px');

    $('.board').css('height', board_height+'px');
    $('.board').css('width', board_width+'px');
    $('.board').css('top', board_offset+'px');

    $('.bottom_space').css('height', space_height+'px');
    $('.bottom_space').css('bottom', space_offset+'px');
    $('.bottom_space').css('width', board_width+'px');

    $('.bottom_player').css('height', player_height+'px');
    $('.bottom_player').css('bottom', player_offset+'px');
    $('.bottom_player').css('width', board_width+'px');
    
    $('.bottom_info').css('height', info_height+'px');
    $('.bottom_info').css('bottom', info_offset+'px');
    $('.bottom_info').css('width', board_width+'px');
    
    $('#bottom_nav').css('height', nav_height+'px');
    $('#bottom_nav').css('bottom', nav_offset+'px');
    
    game = g_gamemap.get(Board.game_num);

    if (Board.board) {
        Board.board.resize();
        Board.applyTheme();
    }
}


function closeAllMenus() {
    $('#main_menu').css('display','none');
    $('#board_menu').css('display','none');
    g_in_menu = false;
}

function listsPageUp() {
    var cur_pos = $('#lists').scrollTop();
    var scroll_amt = $('#lists').height() * .95;
    var new_pos = cur_pos - scroll_amt;
    $('#lists').scrollTop(new_pos);
};

function listsPageDown() {
    var cur_pos = $('#lists').scrollTop();
    var scroll_amt = $('#lists').height() * .95;
    var new_pos = cur_pos + scroll_amt;
    $('#lists').scrollTop(new_pos);
};


function toMinutes(seconds) {
	var seconds = parseInt(seconds);
	var minutes = Math.floor(seconds / 60).toString();
	var remaining_seconds = seconds - minutes * 60;
	
	if ( remaining_seconds.toString().length == 1 ) {
		remaining_seconds = '0' + remaining_seconds.toString();
	}
	else {
		remaining_seconds = remaining_seconds.toString();
	}
	return minutes + ':' + remaining_seconds
}


function runClock(game_num) {
    var game = g_gamemap.get(game_num);
    if (!game || game.result) {
        console.log('in runClock and game not found for game_num ' + game_num + ' or game ended');
        return;
    }
    stopClocks(game_num);

    var whose_move = ['w','b'][game.chess.history().length % 2];
    var not_whose_move = ['b','w'][game.chess.history().length % 2];
    if ( (game.top_is_black && whose_move === 'b') || (!game.top_is_black && whose_move === 'w') ) {
        $('#bottom_time_'+game_num).html(toMinutes(game.s12[not_whose_move+'_clock']));
        $('#bottom_time_'+game_num).css('background-color', '#222222');
        $('#bottom_time_'+game_num).css('color', 'lime');
        $('#top_time_'+game_num).css('background-color', 'darkorange');
        $('#top_time_'+game_num).css('color', 'indigo');
    } else {
        $('#top_time_'+game_num).html(toMinutes(game.s12[not_whose_move+'_clock']));
        $('#top_time_'+game_num).css('background-color', '#222222');
        $('#top_time_'+game_num).css('color', 'lime');
        $('#bottom_time_'+game_num).css('background-color', 'darkorange');
        $('#bottom_time_'+game_num).css('color', 'indigo');
    }

    if (game.chess.history().length > 1) {
        game.clocks[whose_move] = setInterval( function() {
            if (game.s12[whose_move+'_clock'] <= 0) {
                stopClocks(game_num);
                return;
            }
            game.s12[whose_move+'_clock'] -= 1;
            if ( (game.top_is_black && whose_move === 'b') || (!game.top_is_black && whose_move === 'w') ) {
                $('#top_time_'+game_num).html(toMinutes(game.s12[whose_move+'_clock']));
            } else {
                $('#bottom_time_'+game_num).html(toMinutes(game.s12[whose_move+'_clock']));
            }
        }, 1000);
    }
}

function stopClocks(game_num) {
    var game = g_gamemap.get(game_num);
    if (game) {
        clearInterval(game.clocks['w']);
        clearInterval(game.clocks['b']);
    } else {
        console.log('in stopClocks and game not found for game_num ' + game_num);
    }
}


function loadThemes() {
    g_themes = Cookies.get('themes');
    if (!g_themes) {
        g_themes = DEFAULT_THEMES;
        Cookies.set('themes', JSON.stringify(g_themes), {expires: 30000});
    } else {
        g_themes = JSON.parse(g_themes);
    }
    g_theme_nums = Math.floor(Math.random() * g_themes.length);
}


function highlightSquares(board_div, color, move=null, clear=false) {
    board_div.find('.square-55d63').removeClass('highlight-square-'+color);
    if (move && !clear) {
        board_div.find('.square-' + move.to).addClass('highlight-square-'+color);
        board_div.find('.square-' + move.from).addClass('highlight-square-'+color);
    }
}


function getActiveHumanGameNum() {
    var gnum = ''
    Array.from(g_gamemap.values()).map( g => {
        if ( g.human_color != 'x' && !g.result ) {
            gnum = g.game_num;
        }
    });
    return gnum;
}





/*
 *
 * GLOBAL EVENT HANDLERS
 *
 */ 


$( window ).on('resize',function() {
    calcDims();
});

$( window ).on('beforeunload',function() {
    return "If you leave the fics telnet sess will be lost";
});

$( document ).on('mouseup', function() { 
    clearInterval(BoardController.rwtimer);
    clearInterval(BoardController.fftimer);
});

$( document ).on('click', function() { 
    closeAllMenus();
});

$( document ).on('keydown', function(e) {
    if (!Board.game_num) return;

    if ( $.inArray(e.which, [37,38,39,40]) == -1 ) return;

    e.preventDefault();           
    
    var game = g_gamemap.get(Board.game_num);
    if (!game) return;

    if (e.which == 37) {            // left
        if (game.current_move_index > -1) {
            Board.goToMove(Board.game_num, game.current_move_index - 1);
        }
    } else if (e.which == 39) {     //right
        if (game.current_move_index < game.chess.history().length - 1) {
            Board.goToMove(Board.game_num, game.current_move_index + 1);
        }
    } else if (e.which == 38) {     //up
        Board.goToMove(Board.game_num, -1);
    } else if (e.which == 40) {     //down
        Board.goToMove(Board.game_num, game.chess.history().length - 1);
    }
});





/*
 *
 * SOCKET IO
 *
 */


SOCK.on("logged_in", function(msg) {
    Login.mid_attempt = false;

    loadThemes();

    m.request({
        method: 'GET',
        url: '/soundmap'
    })
    .then( (result) => {
        for (i=0; i<result.ambience.length; i++) {
            g_soundmap.ambience.push( new Howl({ src: ['/sound/ambience/' + result.ambience[i]] }) );
        }
        for (i=0; i<result.gong.length; i++) {
            g_soundmap.gong.push( new Howl({ src: ['/sound/gong/' + result.gong[i]] }) );
        }
        for (i=0; i<result.moves.length; i++) {
            g_soundmap.moves.push( new Howl({ src: ['/sound/moves/' + result.moves[i]] }) );
        }
        for (i=0; i<result.captures.length; i++) {
            g_soundmap.captures.push( new Howl({ src: ['/sound/captures/' + result.captures[i]] }) );
        }
        for (i=0; i<result.checks.length; i++) {
            g_soundmap.checks.push( new Howl({ src: ['/sound/checks/' + result.checks[i]] }) );
        }
    })
    .catch( (err) => console.log('EROROROR: ' + err) );

    SOCK.emit('command', 'variables');

    m.route.set('/lobby');
});

SOCK.on("result", function(msg) {
    console.log(msg);
    var ficsobj = window.FICSPARSER.parse(msg);
    console.log(ficsobj);

    var showout = false;
    if ( (ficsobj.cmd_num === 0 || ficsobj.cmd_num === 773450001) && /^123987001/.test(ficsobj.fullbody) === false) {
        showout = true;
    }

    if ( ficsobj.body.match(/You accept the match offer|^Challenge: |withdraws the match offer|updates the match request|declines the match|declines your match|accepts the match offer|You withdraw the match offer|^Issuing:|You decline the match offer/) ) {
        SOCK.emit('command', 'pending');
    }

    if ( !ficsobj.cmd_code ) {
        if ( ficsobj.body.match(/offers you a draw./) ) {
            var g = g_gamemap.get(getActiveHumanGameNum())
            if ( g ) {
                g.blurb = strip(ficsobj.body);
                m.redraw();
            }
        }

        if ( ficsobj.body.match(/declines the draw request/) ) {
            var g = g_gamemap.get(getActiveHumanGameNum())
            if ( g ) {
                //g.blurb = strip(ficsobj.body);
                g.blurb = '';
                m.redraw();
            }
        }

        if ( ficsobj.body.match(/You decline the draw request from/) ) {
            var g = g_gamemap.get(getActiveHumanGameNum())
            if ( g ) {
                g.blurb = '';
                m.redraw();
            }
        }



    }
    if ( ficsobj.cmd_code ) {
        cmd_code = ficsobj.cmd_code;
        // games command result
        if (ficsobj.cmd_code === 43) {
            GameList.lines = ficsobj.body.split('\n');
            m.redraw()

        // sought command result
        } else if (ficsobj.cmd_code === 157) {
            renderSoughtList(ficsobj.body.split('\n'));
        // variables command result
        } else if (ficsobj.cmd_code === 143) {
            var info = ficsobj.body.split(':')[0].split(/\s+/);
            g_user = info[info.length-1];
            m.redraw();
        // draw command result
        } else if (ficsobj.cmd_code === 34) {
            var g = g_gamemap.get(getActiveHumanGameNum());
            console.log('draw returned');
            console.log('g_gamemap is');
            console.log(g_gamemap);
            console.log('human_game is');
            console.log(g);
            if ( g ) {
                if ( ficsobj.body.match(/Draw request sent|You are already offering a draw/) ) {
                    g.blurb = 'Draw offer sent...';
                    m.redraw();
                } else {
                    g.blurb = '';
                    m.redraw();
                }
            }
        // gamemove command result
        } else if (ficsobj.cmd_code === 1) {
            if ( ficsobj.body.match(/You decline the draw request from/) ) {
                var g = g_gamemap.get(getActiveHumanGameNum())
                if ( g ) {
                    g.blurb = '';
                    m.redraw();
                }
            }
        // moves command result
        } else if (ficsobj.cmd_code === 77) {
            var movesobj = window.MOVESPARSER.parse(ficsobj.body);
            var game_num = movesobj.get("game_num");
            var game = g_gamemap.get(game_num);

            if (game) { 
                game.initMoves(movesobj); 
                m.route.set('/board_controller?cur_game_num='+game_num);
            }
        // pending command result
        } else if (ficsobj.cmd_code === 87) {
            var which = '';
            Alerts.offers_to = [];
            Alerts.offers_from = [];
			lines = ficsobj.body.split(/[\n\r]/).map( l => {
                if ( l.match(/^Offers to other players:/) ) {
                    which = 'to';
                    return;
                }
                if ( l.match(/^Offers from other players:/) ) {
                    which = 'from';
                    return;
                }
                if ( l.match(/^  /) ) {
                    if ( which === 'to' ) {
                        Alerts.offers_to.push(strip(l));
                    }
                    if ( which === 'from' ) {
                        Alerts.offers_from.push(strip(l));
                    }
                }
			})
            console.log('are we about to redraw?');
			m.redraw();
        // finger command result
        } else if (ficsobj.cmd_code === 37) {
			Finger.text = ficsobj.body;
			m.redraw();
        // who command result
        } else if (ficsobj.cmd_code === 146) {

			var cols = [[],[],[]];
			lines = ficsobj.body.split(/[\n\r]/).map( l => {
				var items = l.split(/\s\s+/);
				for (i=0; i<items.length; i++) {
					if (items[i] && !/^ /.test(items[i])) {
						cols[i].push(items[i]);
					}
				}
			})
			g_players = [];
			cols.map( col => {
				col.map( it => {
					var re = /[\^~:#. &]/;
					var stat = it.match(re)[0] ;
					var sp = it.split(stat);
					var sp2 = sp[1].split('(');
					var name = sp2[0]
					var extra = sp2[1] ? '('+sp2[1] : ''
					var p = [sp[0], stat, name, extra];
					g_players.push(p);
				})
			})

            m.route.set('/playerlist');
        }
    }
    
    //showout = true;

    if (ficsobj.unobserve) {
        console.log('remove game nums');
        console.log(ficsobj.remove_game_nums);

        for (i=0; i<ficsobj.remove_game_nums.length; i++) {
            var game = g_gamemap.get(ficsobj.remove_game_nums[i]);
            if ( game.situ === 'IN PROGRESS' ) {
                game.situ = 'NO LONGER OBSERVING';
            }
            stopClocks(ficsobj.remove_game_nums[i]);
        }
    }

    if (ficsobj.game_info.result) {
        var game_num = ficsobj.game_info.game_num;
        var game = g_gamemap.get(game_num);
        game.result = ficsobj.game_info.result;
        game.blurb = ''; //kind of a hacky place to put this


        game.situ = ficsobj.game_info.situ;
        //if ( !game.situ ) { game.situ = 'IN PROGRESS'; }

        if (['1-0','0-1','1/2-1/2'].indexOf(game.result) != -1) {
            if ( BoardController.cur_game_num && BoardController.cur_game_num === game_num ) {
                g_soundmap.gong[Math.floor(Math.random() * g_soundmap.gong.length)].play();
            }
            stopClocks(game_num);
        }
        m.redraw();
    }

    if (ficsobj.observe) {
        var game_num = ficsobj.game_info.game_num;
        //if (g_gamemap.get(game_num)) {    //FIXME
        //    removeGame(game_num);
        //}
        g_gamemap.set(game_num, new Game(ficsobj.s12, ficsobj.game_info));
        g_theme_nums = g_theme_nums + 1;
        if (g_theme_nums >= g_themes.length) g_theme_nums = 0;
        g_gamemap.get(game_num).theme = g_themes[g_theme_nums];
        if (ficsobj.s12.my_rel === '1' || ficsobj.s12.my_rel === '-1') { 
            g_gamemap.get(game_num).human_color =  (ficsobj.s12.whose_move === 'B' && ficsobj.s12.my_rel === '1') || (ficsobj.s12.whose_move === 'W' && ficsobj.s12.my_rel === '-1') ? 'b' : 'w';
        }
        SOCK.emit('command', 'moves ' + game_num);
    } else if (ficsobj.style12) {
        var game_num = ficsobj.s12.game_num;
        var game = g_gamemap.get(game_num);

        if (game.chess) { 
            if (game.chess.history().length != game.getMoveIndexFromS12() + 1) {
                console.log('chess says '+game.chess.history().length + ' but s12 says ' + game.getMoveIndexFromS12() +', doing nothing');
                //SOCK.emit('command', 'moves '+game_num);
            } else {
                var move_info = game.chess.move(ficsobj.s12.move_note_short, {sloppy:true});
                if (move_info) {
                    if ( BoardController.cur_game_num && BoardController.cur_game_num === game.game_num ) {
                        if (game.chess.in_check()) {
                            g_soundmap.checks[Math.floor(Math.random() * g_soundmap.checks.length)].play();
                        } else if (['n','b','k','q','p'].includes(move_info.flags)) {
                            g_soundmap.moves[Math.floor(Math.random() * g_soundmap.moves.length)].play();
                        } else {
                            g_soundmap.captures[Math.floor(Math.random() * g_soundmap.captures.length)].play();
                        }
                    }

                    game.s12 = ficsobj.s12;
                    if (['1-0','0-1','1/2-1/2'].indexOf(game.result) === -1) {  // maybe '*' also?
                        runClock(game_num);
                    }

                    var new_move_index = game.chess.history().length - 1;
                
                    game.movetimes[new_move_index] = ficsobj.s12.move_time;
                    game.fens[new_move_index] = game.chess.fen().split(/\s+/)[0];
                    //appendToMoveList(game_num, new_move_index);


                    var whose_move = ['w','b'][new_move_index % 2];


                    console.log('move_indexes');
                    console.log('new_move_index:');
                    console.log(new_move_index);
                    console.log('game.current_move_index:');
                    console.log(game.current_move_index);
                    //if ( Board.game_num === game.game_num && new_move_index == game.current_move_index + 1) {
                    game.current_move_index = new_move_index;
                    if ( Board.game_num === game.game_num ) {
                        if (whose_move === game.human_color && !game.premove) { Board.goToMove(game_num, new_move_index, animate=false) }
                        else { Board.goToMove(game_num, new_move_index, animate=true); }
                    }

                }

                if (ficsobj.s12.my_rel === '1' && game.premove) {
                    var source = game.premove.from;
                    var target = game.premove.to;
                    var piece = game.premove.piece;
                    var mv = { from: source, to: target };

                    if (/[18]$/.test(target) && /[pP]/.test(piece)) {
                        var choices = game.chess.moves({verbose:true});
                        for (var i=0; i<choices.length; i++) {
                            m = choices[i];
                            if (m.from === source && m.to === target) {
                                mv.promotion = 'q';
                                break;
                            }
                        }
                    }

                    highlightSquares($('#board'), 'red', clear=true);
                    game.premove = null;

                    var valid_move = game.chess.move(mv);
                    if (valid_move) {
                        game.chess.undo();
                        SOCK.emit('command',valid_move.san);
                    }
                }
            }
        }

        //showout = false;
    }

    if (ficsobj.fullbody.length && showout && !ficsobj.style12) 
    {
        $('#shellout2').append(ficsobj.fullbody.replace(/^773450001/, '\n<font color="red">fics%</font>') + '\n');
        $('#shellout').scrollTop($('#shellout').prop('scrollHeight'));
    }
});






/*
 *
 * MITHRIL COMPONENTS
 *
 */


var Login = {
    username : '',
    password : '',
    mid_attempt : false,
    oninit: function(vnode) {
        if (parseInt(Cookies.get('auto_login'))) {
            var u = Cookies.get('username');
            var p = Cookies.get('password');
            if (u) {
                SOCK.emit('login', [u,p]);
                Login.mid_attempt = true;
            }
        }
    },
    login : function() {
        var auto_login = document.getElementById('autocheck').checked;
        if ( auto_login ) {
            Cookies.set('auto_login', '1');
            Cookies.set('username', Login.username);
            Cookies.set('password', Login.password);
        } else {
            Cookies.remove('auto_login');
            Cookies.remove('username');
            Cookies.remove('password');
        }
        SOCK.emit('login', [Login.username, Login.password]);
    },
    view : function(vnode) {
        return Login.mid_attempt ?
            m('div', {}, `Attempting login for ${Cookies.get('username')}...`)
            :
            m( 'table', [ 
           m('tr', [
               m('td', 'Username:'),
               m('td', m('input', {type: 'text', size: '12', value: Login.username, oninput: (e) => Login.username = e.target.value, onkeypress: (e) => {if (e.which == 13) Login.login()}})
                   ), 
           ]),
           m('tr', [
               m('td', 'Password:'),
               m('td', m('input', {type: 'password', size: '12', value: Login.password, oninput: (e) => Login.password = e.target.value, onkeypress: (e) => {if (e.which == 13) Login.login()}})
                   ), 
           ]),
           m('tr', [
               m('td', {colspan: 2, align: 'center'}, 
                   m('button',  {id:'logbutt', onclick: (e) => {
                            Login.login();
                            return false;
                       }
                   }, 'login')
                ), 
           ]),
           m('tr', [
               m('td', {colspan: 2, align: 'center'}, 
                   m('input',  {type: 'checkbox', id: 'autocheck'}),
                   m('span', {}, 'automatically login next time'),
                ), 
           ]),
       ]);
    }
}

var MainMenu = {
    view: function(vnode) {
        return m('a', {"class":"dropdown","onclick": function(e) {
            if ( !g_in_menu ) {
                closeAllMenus();
                $('#main_menu').css('display','block');
                g_in_menu = true;
                return false;
            }
        }}, 
				'MM',
				m("div", {"id":"main_menu","class":"dropdown_content"},
					[
						m("a", {"id":"username"}, 
							g_user
						),
						
                        m("a", {
                                onclick: function(e) {
                                    SOCK.emit('command', 'getgame');
                                }
                            }, 
							"get game"
						),
                        
                        m("a", {"onclick": () => SOCK.emit('command','seek')}, 
							"seek"
						),
                        
                        m("a", {"onclick": () => SOCK.emit('command','sought all')}, 
							"sought"
						),
                        
                        m("a", {
                                onclick: function(e) {
                                    SOCK.emit('command', 'who');
                                    m.route.set('/playerlist');
                                }
                            }, 
							"players"
						),
						
                        m("a", {
                                onclick: function(e) {
                                    SOCK.emit('command', 'games');
                                    m.route.set('/gamelist');
                                }
                            }, 
							"games"
						),
                        
                        BoardController.cur_game_num && g_gamemap.get(BoardController.cur_game_num)
                        ?
						m("a", {
                                onclick: function(e) {
                                    m.route.set('/board_controller?cur_game_num='+BoardController.cur_game_num);
                                }
                            }, 
							"board"
						)
                        :
                        null,
						
                        /*
						m("a", {}, 
							"puzzles"
						),
						m("a", {}, 
							"tournaments"
						),
						m("a", {}, 
							"teams"
						),
						m("a", {}, 
							"OTB relays"
						),
						m("a", {}, 
							"shouts/tells/channels"
						),
                        */
						
                        m("a", {}, 
							"preferences"
						),
						
                        m("a", {
                                onclick: function(e) {
                                    Cookies.remove('auto_login');
                                    Cookies.remove('username');
                                    Cookies.remove('password');
                                    SOCK.emit('command', 'exit');
                                    m.route.set('/login');
                                }
                            },
							"logout"
						),
					]
				)
			);
    }
}

var GameSwitcher = {
    view: function(vnode) {
        var gnums_ordered = Array.from(g_gamemap.keys());
        var i = gnums_ordered.indexOf(BoardController.cur_game_num);
        var next = i+1;
        var prev = i-1;
        if ( next >= gnums_ordered.length ) {
            next = 0;
        }
        if ( prev < 0 ) {
            prev = gnums_ordered.length - 1;
        }
        return [
            m('a', {onclick: () => m.route.set('/board_controller?cur_game_num='+gnums_ordered[prev], null, {state: {key: Date.now()}})}, '<'),
            m('a', {}, 'G'),
            m('a', {onclick: () => m.route.set('/board_controller?cur_game_num='+gnums_ordered[next], null, {state: {key: Date.now()}})}, '>'),
        ];
    }
}

var Alerter = {
    view: function(vnode) {
        var alerts = Alerts.offers_to.length || Alerts.offers_from.length ? true : false;
        return m('a', {'style': alerts ? 'color:lime' : '','onclick':function(e) {
                                            m.route.set('/alerts');
                                            SOCK.emit('command', 'pending');
                                            return false;
                                        }
        }, 'NN');
    }
}


var Lobby = {
    view: function(vnode) {
        return m("div", {"id":"page"},
                    m('div', {'id': 'top_nav', 'class': 'evenly_spaced nav_container'},
                        [
                            m(MainMenu),
                            m(Alerter),
                        ]
                     )
        );

    }
}

var Alerts = {
    offers_to: [],
    offers_from: [],
    oncreate: function(vnode) {
        calcDims();
    },
    onupdate: function(vnode) {
        calcDims();
    },

    primp: function(s) {
        var parts = s.split(':');
        var num = parts[0];
        var txt = strip(parts[2]);
        return {num:num, txt:txt};
    },

    view: function(vnode) {
        return m("div", {"id":"page"},
                    m('div', {'id': 'top_nav', 'class': 'evenly_spaced nav_container'},
                        [
                            m(MainMenu),
                            m(Alerter),
                        ]
                     ),
                m('div', {'id':'lists','class':'lists'},
                    m('pre', {id:'lists2'},

                        Alerts.offers_from.map( x => {
                            var info = Alerts.primp(x);

                            return m('div',{}, 
                                m('a', {'onclick': () => {SOCK.emit('command','accept '+info.num)}}, info.txt),
                                m('a', {'style': 'color:red', 'onclick': () => {SOCK.emit('command','decline '+info.num)}}, 'DECLINE'),
                            );
                        }),

                        Alerts.offers_to.map( x => {
                            var info = Alerts.primp(x);

                            return m('div',{}, 
                                m('a', {}, info.txt),
                                m('a', {'style': 'color:red', 'onclick': () => {SOCK.emit('command','withdraw '+info.num)}}, 'WITHDRAW'),
                            );
                        }),

                    )
                ),
        );

    }
}


var Finger = {
	text: '',
    oncreate: function(vnode) {
        calcDims();
    },
    onupdate: function(vnode) {
        calcDims();
    },
    view: function(vnode) {
		var line1 = Finger.text.split('\n')[0];
        Finger.name = line1.split(/\s/).pop().split(':')[0].split('(')[0];
        return m("div", {"id":"page"},
                    m('div', {'id': 'top_nav', 'class': 'evenly_spaced nav_container'},
                        [
                            m(MainMenu),
                            m(Alerter),
                        ]
                     ),
                m('div', {'id':'lists','class':'lists'},
                    m('pre', {id:'lists2'},
						Finger.text
                    )
                ),
                m('div', {'id': 'bottom_nav', 'class': 'evenly_spaced nav_container'},
                    [

                        m('a', {onclick: function() {
                            SOCK.emit('command', 'match '+Finger.name);
                            return false;
                        }}, 
                            'Chal'),

                        m('a', {onclick: function() {
                            SOCK.emit('command', 'follow '+Finger.name);
                            return false;
                        }}, 
                            'Fol'),

                        m('a', {onclick: function() {
                            return false;
                        }}, 
                            'Tel'),

                        m('a', {onclick: function() {
                            return false;
                        }}, 
                            'Msg'),
                    ]
                 ),
        );

    }
}

var PlayerList = {
    oncreate: function(vnode) {
        calcDims();
    },
    view: function(vnode) {
        return m("div", {"id":"page"},
                    m('div', {'id': 'top_nav', 'class': 'evenly_spaced nav_container'},
                        [
                            m(MainMenu),
                            m(Alerter),
                        ]
                     ),
                m('div', {'id':'lists','class':'lists'},
                    m('pre', {id:'lists2'},
                        Array.from(g_players).map( x => {
                                return [m('a', {'href':'#', 'class':'list-item', 'style':'color:orange',
                                        'onclick':function(e) {
                                            $(this).css('color', 'red');
                                            m.route.set('/finger');
                                            SOCK.emit('command', 'finger ' + x[2]);
                                            return false;
                                        }},
                                        x.join('') ),
                                        m('br')];
                        })
                    )
                ),
                m('div', {'id': 'bottom_nav', 'class': 'evenly_spaced nav_container'},
                    [
                        m('a', {onclick: listsPageUp},
                            '^^^'),

                        m('a', {onclick: function() {
                            SOCK.emit('command', 'who');
                            return false;
                        }}, 
                            'All'),

                        m('a', {onclick: function() {
                            SOCK.emit('command', 'who a');
                            return false;
                        }}, 
                            'Av'),

                        m('a', {onclick: function() {
                            SOCK.emit('command', 'who R');
                            return false;
                        }}, 
                            'Reg'),

                        m('a', {onclick: function() {
                            SOCK.emit('command', 'who U');
                            return false;
                        }}, 
                            'Unr'),

                        m('a', {onclick: listsPageDown},
                            'vvv'),

                    ]
                 ),
        );

    }
}

var GameList = {
    lines: [],

    oncreate: function(vnode) {
        calcDims();
    },
    view: function(vnode) {
        return m("div", {"id":"page"},
                    m('div', {'id': 'top_nav', 'class': 'evenly_spaced nav_container'},
                        [
                            m(MainMenu),
                            m(Alerter),
                        ]
                     ),
                m('div', {'id':'lists','class':'lists'},
                    m('pre', {id:'lists2'},
                        Array.from(GameList.lines).map( x => {
                            if (x.replace(/[\s\n\t\r\x07]*/g,'')) {
                                var gamenum = x.replace(/^\s+|\s+$/g, '').split(/\s+/)[0];
                                return [m('a', {'href':'#', 'class':'list-item', 'style':'color:orange',
                                        'onclick':function(e) {
                                            $(this).css('color', 'cyan');
                                            SOCK.emit('command', 'observe ' + gamenum);
                                            return false;
                                        }},
                                        x ),
                                        m('br')];
                            } else {
                                return null;
                            }
                        })
                    )
                ),
                m('div', {'id': 'bottom_nav', 'class': 'evenly_spaced nav_container'},
                    [
                        m('a', {onclick: listsPageUp},
                            '^'),

                        m('a', {onclick: function() {
                            SOCK.emit('command', 'games /bsl');
                            return false;
                        }}, 
                            'ALL'),

                        m('a', {onclick: function() {
                            SOCK.emit('command', 'games /bl');
                            return false;
                        }}, 
                            'BLZ'),

                        m('a', {onclick: function() {
                            SOCK.emit('command', 'games /s');
                            return false;
                        }}, 
                            'RPD'),

                        m('a', {onclick: function() {
                            SOCK.emit('command', 'games /e');
                            return false;
                        }}, 
                            'EX'),

                        m('a', {onclick: listsPageDown},
                            'v'),

                    ]
                 ),
        );

    },
}

var Board = {
    game_num: '',
    board: null,
    createChessboard: function() {
        var game = g_gamemap.get(Board.game_num);
        Board.board = new ChessBoard('board', {
            pieceTheme: game.pieceTheme,
            position: game.chess.fen().split(/\s+/)[0],
            draggable:true,
            onDragStart : function(source, piece, pos, orientation) {
                if (piece[0] === game.human_color) {
                    if (game.s12.my_rel === '-1') {
                        game.empty_square = source;
                        game.empty_piece = piece;
                    }
                    return true;
                }
                return false;
            },
            onDrop : function(source, target, piece, newPos, oldPos, orientation) {
                if (target === game.empty_square) {
                    var pos = Board.board.position();

                    if (!pos[game.empty_square]) {
                        pos[game.empty_square] = game.empty_piece;
                        Board.board.position(pos);
                    }

                    game.empty_square = null;
                    game.empty_piece = null;


                } else {
                    var mv = { from: source, to: target };
                    if (/[18]$/.test(target) && /[pP]/.test(piece)) {
                        var choices = game.chess.moves({verbose:true});
                        for (var i=0; i<choices.length; i++) {
                            m = choices[i];
                            if (m.from === source && m.to === target) {
                                mv.promotion = 'q';
                                break;
                            }
                        }
                    }
                    var valid_move = game.chess.move(mv);
                    if (valid_move) {
                        game.chess.undo();
                    }
                    if (game.s12.my_rel === '1') {
                        if (!valid_move) {
                            if (game.empty_square) {
                                var pos = Board.board.position();

                                if (!pos[game.empty_square]) {
                                    pos[game.empty_square] = game.empty_piece;
                                    Board.board.position(pos, false);
                                }

                                game.empty_square = null;
                                game.empty_piece = null;
                            }
                            return 'snapback';
                        } else {
                            SOCK.emit('command', valid_move.from + '-' + valid_move.to);
                        }
                    } else if (game.s12.my_rel === '-1') {
                        var mv = {}
                        if (source != target) {
                            if (target === 'offboard') {
                                if (game.premove) {
                                    if (game.premove.from === source) {
                                        game.premove = null;
                                        highlightSquares($('#board'), 'red', clear=true);
                                    }
                                } else { 
                                    //do nothing
                                }
                            } else {
                                mv.from = source;
                                mv.to = target;
                                mv.piece = piece;
                                game.premove = mv;
                                highlightSquares($('#board'), 'red', clear=true);
                                highlightSquares($('#board'), 'red', move=mv);

                                if (game.empty_square) {
                                    var pos = Board.board.position();

                                    if (!pos[game.empty_square]) {
                                        pos[game.empty_square] = game.empty_piece;
                                        Board.board.position(pos, false);
                                    }

                                    game.empty_square = null;
                                    game.empty_piece = null;
                                }
                            }
                        }

                        return 'snapback'
                    }
                }
            },
        });

    },
    goToMove: function(game_num, i, animate=false) {
        if ( game_num !== Board.game_num || !$('#board').children().length ) {
            console.log('this should not happen');
            return;
        }

        var game = g_gamemap.get(Board.game_num);
        //game.current_move_index = i;
        if (i == -1) {
            Board.board.position(game.startfen, animate);
        } else {
            if (game.empty_square) { // piece is hovering
                Board.board.position(game.fens[i], animate);
                var pos = Board.board.position();
                var piece_there_now = pos[game.empty_square];
                if (piece_there_now === game.empty_piece) {
                    delete pos[game.empty_square];
                    Board.board.position(pos, false);
                } else {
                    game.empty_square = null;
                    game.empty_piece = null;
                }
            } else {
                Board.board.position(game.fens[i], animate);
            }

            var mv = game.chess.history({verbose: true})[i];
            console.log('mv is ' + mv);
            console.log('gihlight squares is next');

            highlightSquares($('#board'), 'yellow', move=mv);

        }
    },

    applyTheme: function() {
        var game = g_gamemap.get(Board.game_num);
        if ( game.human_color === 'b' ) {
            Board.board.flip();
        }

        $('#board').find('.white-1e1d7').css('background-color', tinycolor(game.theme.light_rgba));
        $('#board').find('.white-1e1d7').css('color', tinycolor(game.theme.dark_rgba));
        $('#board').find('.black-3c85d').css('background-color', tinycolor(game.theme.dark_rgba));
        $('#board').find('.black-3c85d').css('color', tinycolor(game.theme.light_rgba));

        $('#board').find('.board-b72b1').css('background-image', game.theme.texture ? 'url(/textures/' + game.theme.texture + ')' : 'none');
        $('#board').find('.board-b72b1').css('background-repeat', 'no-repeat');
        $('#board').find('.board-b72b1').css('background-position', 'center');
        $('#board').find('.board-b72b1').css('background-size', 'cover');

    },

    oncreate: function(vnode) {
        console.log('IN B ONCREATE');
        Board.createChessboard();
        Board.applyTheme();
        var game = g_gamemap.get(BoardController.cur_game_num);
        Board.goToMove(Board.game_num, game.current_move_index, animate=false) ;
        runClock(Board.game_num);
    },
    oninit: function(vnode) {
        console.log('IN B ONINIT');
        Board.game_num = vnode.attrs.game_num;
        var game = g_gamemap.get(Board.game_num);
        if ( game.human_color === 'b' ) {
            game.top_is_black = false;
        }

    },
    onupdate: function(vnode) {
        console.log('IN B ONUPDATE');
        if ( Board.game_num != vnode.attrs.game_num ) {
            Board.game_num = vnode.attrs.game_num;
        }
    },

    view: function(vnode) {
        var game = g_gamemap.get(Board.game_num);

		return [
                m("div", {"id":"top_info_"+Board.game_num,"class":"info_container top_info"}, 
                        m('div', {'class':'centerbold'},
						    game.chess.header().Event)
				),

				m("div", {"id":"top_player_"+Board.game_num,"class":"player_container top_player"}, 
                        game.top_is_black
                        ?
                        m('div', {"class":"player_name"},
						    game.chess.header().Black + ' (' + game.chess.header().BlackElo + ')',
                            m('div', {'id':'top_time_'+Board.game_num,'class':'player_time'},
                                toMinutes(game.s12.b_clock))
                        )
                        :
                        m('div', {"class":"player_name"},
						    game.chess.header().White + ' (' + game.chess.header().WhiteElo + ')',
                            m('div', {'id':'top_time_'+Board.game_num,'class':'player_time'},
                                toMinutes(game.s12.w_clock))
                        )
				),


				m("div", {"id":"top_space_"+Board.game_num,"class":"player_space top_space"}),

				m("div", {"id":"board","class":"board"}),

                m("div", {"id":"bottom_space_"+Board.game_num,"class":"player_space bottom_space"}),


				m("div", {"id":"bottom_player_"+Board.game_num,"class":"player_container bottom_player"}, 
                        game.top_is_black
                        ?
                        m('div', {"class":"player_name"},
						    game.chess.header().White + ' (' + game.chess.header().WhiteElo + ')',
                            m('div', {'id':'bottom_time_'+Board.game_num,'class':'player_time'},
                                toMinutes(game.s12.w_clock))
                        )
                        :
                        m('div', {"class":"player_name"},
						    game.chess.header().Black + ' (' + game.chess.header().BlackElo + ')',
                            m('div', {'id':'bottom_time_'+Board.game_num,'class':'player_time'},
                                toMinutes(game.s12.b_clock))
                        )
				),

				m("div", {"id":"bottom_info_"+Board.game_num,"class":"info_container bottom_info"}, 
                    [
                        m('div', {'id':'result_'+Board.game_num,'class':'centerbold'},
                            game.situ + ' ' + game.result
                        ),
                        game.blurb
                        ?
                        m('div', {'class':'centerbold', 'style':'color:red'},
                            game.blurb
                        )
                        :
                        null
                    ]

				),
        ]
    }
}
    
var BoardController = {
    cur_game_num: '',

    oncreate: function(vnode) {
        console.log('IN BC ONCREATE');
        calcDims();
    },
    oninit: function(vnode) {
        console.log('IN BC ONINIT');
        if ( vnode.attrs.cur_game_num ) {
            BoardController.cur_game_num = vnode.attrs.cur_game_num;
        }
    },
    onupdate: function(vnode) {
        console.log('IN BC ONUPDATE');
        if ( BoardController.cur_game_num != vnode.attrs.cur_game_num ) {
            BoardController.cur_game_num = vnode.attrs.cur_game_num;
        }
    },
    view: function(vnode) {
        var game = g_gamemap.get(BoardController.cur_game_num);
        var human_in_progress = game.human_color != 'x' && !game.result;
        return m("div", {"id":"page"},
				[
                    m('div', {'id': 'top_nav', 'class': 'evenly_spaced nav_container'},
                        [
                            m(MainMenu),
                            m(GameSwitcher),
                            m(Alerter),
                        ]
                    ),
	

                    m("div", {"id":"centerer","class":"centerer"},
                        m(Board, {game_num: BoardController.cur_game_num})
                    ),


                    m('div', {'id': 'bottom_nav', 'class': 'evenly_spaced nav_container'},
                        [
                            m('a', {"class":"dropdown","onclick": function(e) {

                                if ( !g_in_menu ) {
                                    closeAllMenus();
                                    $('#board_menu').css('display','block');
                                    g_in_menu = true;
                                    return false;
                                }
                            }},
									'BM',
									m("div", {"id":"board_menu","class":"dropdown_content dropup"},
										[

                                            human_in_progress
                                            ?
                                            [
                                                m("a", {"onclick": () => SOCK.emit('command','draw')}, 
                                                    "draw"
                                                ),
                                                m("a", {"onclick": () => SOCK.emit('command','resign')}, 
                                                    "resign"
                                                ),
                                            ]
                                            :
                                            null,

                                            game.human_color != 'x' && game.result
                                            ?
                                            [
                                                m("a", {"onclick": () => SOCK.emit('command','rematch')}, 
                                                    "rematch"
                                                ),
                                                m("a", {"onclick": () => SOCK.emit('command','getgame')}, 
                                                    "get new game"
                                                ),
                                            ]
                                            :
                                            null,

                                            game.human_color != 'x' && game.chess.history().length < 2 && !game.result
                                            ?
											m("a", {"onclick": () => SOCK.emit('command','abort')}, 
												"abort"
											)
                                            :
                                            null,

                                            !human_in_progress 
                                            ?
                                            [
                                                m("a", {}, 
                                                    "analyze"
                                                ),
                                                m("a", {}, 
                                                    "remove"
                                                ),
                                            ]
                                            :
                                            null,

											m("a", {}, 
												"share/export"
											),
										]
									)
								),

                            m('a', {onmousedown: BoardController.rewind}, //, onclick: BoardController.moveBack},
                                '<<'),

                            m('a', {onclick: function() {
                                game.top_is_black = game.top_is_black ? false : true;
                                Board.board.flip();

                                $('#board').find('.white-1e1d7').css('background-color', tinycolor(game.theme.light_rgba));
                                $('#board').find('.white-1e1d7').css('color', tinycolor(game.theme.dark_rgba));
                                $('#board').find('.black-3c85d').css('background-color', tinycolor(game.theme.dark_rgba));
                                $('#board').find('.black-3c85d').css('color', tinycolor(game.theme.light_rgba));

                                $('#board').find('.board-b72b1').css('background-image', game.theme.texture ? 'url(/textures/' + game.theme.texture + ')' : 'none');
                                $('#board').find('.board-b72b1').css('background-repeat', 'no-repeat');
                                $('#board').find('.board-b72b1').css('background-position', 'center');
                                $('#board').find('.board-b72b1').css('background-size', 'cover');
                                runClock(BoardController.cur_game_num);
                                return false;
                            }}, 
                                'F'),

                            m('a', {onmousedown: BoardController.fastforward}, //, onclick: BoardController.moveForward},
                                '>>'),

                            m('a', {},
                                'XX'),

                        ]
                     ),
				]
			)
    },
    moveBack: function() {
        var game = g_gamemap.get(BoardController.cur_game_num);
        if (game.current_move_index > -1) {
            Board.goToMove(game.game_num, game.current_move_index - 1);
        }
        return false;
    },
    moveForward: function() {
        var game = g_gamemap.get(BoardController.cur_game_num);
        if (game.current_move_index < game.chess.history().length - 1) {
            Board.goToMove(game.game_num, game.current_move_index + 1);
        }
        return false;
    },
    rewind: function() {
        var game = g_gamemap.get(BoardController.cur_game_num);
        if (game.current_move_index > -1) {
            BoardController.rwtimer = setInterval( function() {
                                    if (game.current_move_index > -1) {
                                        Board.goToMove(game.game_num, game.current_move_index - 1);
                                    }
                                    m.redraw();
            }, 80);
        }
        return false;
    },
    fastforward: function() {
        var game = g_gamemap.get(BoardController.cur_game_num);
        if (game.current_move_index < game.chess.history().length - 1) {
            BoardController.fftimer = setInterval( function() {
                                    if (game.current_move_index < game.chess.history().length - 1) {
                                        Board.goToMove(game.game_num, game.current_move_index + 1);
                                    }
                                    m.redraw();
            }, 80);
        }
        return false;
    },
}


m.route.set('/login');

m.route(ROOT, "/login", {
    "/lobby": Lobby,
    "/gamelist": GameList,
    "/login": Login,
    "/board_controller": BoardController,
    "/playerlist": PlayerList,
    "/finger": Finger,
    "/alerts": Alerts,
})







