const m = require('mithril')
//const m = mithril();
ficswrap = io();
var root = document.body;

var Login = {
    username : '',
    password : '',
    mid_attempt : false,
    oninit: function(vnode) {
        if (parseInt(Cookies.get('auto_login'))) {
            var u = Cookies.get('username');
            var p = Cookies.get('password');
            if (u) {
                ficswrap.emit('login', [u,p]);
                Login.mid_attempt = true;
            }
        }
    },
    view : function(vnode) {
        return Login.mid_attempt ?
            m('div', {}, `Attempting login for ${Cookies.get('username')}...`)
            :
            m( 'table', [ 
           m('tr', [
               m('td', 'Username:'),
               m('td', m('input', {type: 'text', size: '12', value: Login.username, oninput: (e) => Login.username = e.target.value})
                   ), 
           ]),
           m('tr', [
               m('td', 'Password:'),
               m('td', m('input', {type: 'password', size: '12', value: Login.password, oninput: (e) => Login.password = e.target.value})
                   ), 
           ]),
           m('tr', [
               m('td', {colspan: 2, align: 'center'}, 
                   m('button',  {onclick: (e) => {
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
                            ficswrap.emit('login', [Login.username, Login.password]);
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


NAV_HEIGHT_SHARE = .05;
PLAYER_HEIGHT_SHARE = .05;
SPACE_HEIGHT_SHARE = .03;
INFO_MIN_HEIGHT_SHARE = .05;
BOARD_MAX_HEIGHT_SHARE = 1 - (NAV_HEIGHT_SHARE * 2) - (PLAYER_HEIGHT_SHARE * 2) - (SPACE_HEIGHT_SHARE * 2) - (INFO_MIN_HEIGHT_SHARE * 2);

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

    var nav_offset = 0;
    var info_offset = nav_height;
    var player_offset = info_offset + info_height;
    var space_offset = player_offset + player_height;
    var board_offset = space_offset + space_height;

    $('.lists').css('height', (h - 2*nav_height) + 'px');
    $('.lists').css('top', info_offset+'px');

    $('#top_nav').css('height', nav_height+'px');
    $('#top_nav').css('top', nav_offset+'px');
    
    $('.top_info').css('height', info_height+'px');
    $('.top_info').css('top', info_offset+'px');
    
    $('.top_player').css('height', player_height+'px');
    $('.top_player').css('top', player_offset+'px');
    
    $('.top_space').css('height', space_height+'px');
    $('.top_space').css('top', space_offset+'px');

    $('.board').css('height', board_height+'px');
    $('.board').css('width', board_width+'px');
    $('.board').css('top', board_offset+'px');

    $('.bottom_space').css('height', space_height+'px');
    $('.bottom_space').css('bottom', space_offset+'px');

    $('.bottom_player').css('height', player_height+'px');
    $('.bottom_player').css('bottom', player_offset+'px');
    
    $('.bottom_info').css('height', info_height+'px');
    $('.bottom_info').css('bottom', info_offset+'px');
    
    $('#bottom_nav').css('height', nav_height+'px');
    $('#bottom_nav').css('bottom', nav_offset+'px');
    
    if (Board.board) {
        Board.board.resize();
        Board.applyTheme();
    }
}

var TopMenu = {
    view: function(vnode) {
        return m('a', {"class":"dropdown"}, 
				'M',
				m("div", {"class":"dropdown_content"},
					[
						m("a", {}, 
							playername
						),
						m("a", {
                                onclick: function(e) {
                                    ficswrap.emit('command', 'getgame');
                                }
                            }, 
							"get game"
						),
						m("a", {}, 
							"seek"
						),
						m("a", {}, 
							"sought"
						),
						m("a", {}, 
							"unseek"
						),
						m("a", {
                                onclick: function(e) {
                                    ficswrap.emit('command', 'who');
                                    m.route.set('/playerlist');
                                }
                            }, 
							"players"
						),
						m("a", {
                                onclick: function(e) {
                                    ficswrap.emit('command', 'games');
                                    m.route.set('/gamelist');
                                }
                            }, 
							"games"
						),
						m("a", {}, 
							"match"
						),
						m("a", {}, 
							"themes"
						),
						m("a", {}, 
							"relays"
						),
						m("a", {}, 
							"sound"
						),
						m("a", {
                                onclick: function(e) {
                                    Cookies.remove('auto_login');
                                    Cookies.remove('username');
                                    Cookies.remove('password');
                                    ficswrap.emit('command', 'exit');
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
        var gnums_ordered = Array.from(gamemap.keys());
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
            //m('a', {onclick: () => {BoardController.cur_game_num = gnums_ordered[prev]; Board.game_num = gnums_ordered[prev]; m.redraw(); m.route.set('/board_controller');}}, '<'),
            m('a', {}, 'G'),
            m('a', {onclick: () => m.route.set('/board_controller?cur_game_num='+gnums_ordered[next], null, {state: {key: Date.now()}})}, '>'),
        ];
    }
}

var ThemeSwitcher = {
    view: function(vnode) {
        return m('a', {}, 'T');
    }
}


var Lobby = {
    view: function(vnode) {
        return m("div", {"id":"page"},
                    m('div', {'id': 'top_nav', 'class': 'evenly_spaced nav_container'},
                        [
                            m(TopMenu),
                            m(ThemeSwitcher),
                        ]
                     )
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
        console.log('Finger.name');
        console.log(Finger.name);
        return m("div", {"id":"page"},
                    m('div', {'id': 'top_nav', 'class': 'evenly_spaced nav_container'},
                        [
                            m(TopMenu),
                            m(ThemeSwitcher),
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
                            ficswrap.emit('command', 'match '+Finger.name);
                            return false;
                        }}, 
                            'Ma'),

                        m('a', {onclick: function() {
                            ficswrap.emit('command', 'follow '+Finger.name);
                            return false;
                        }}, 
                            'Fol'),

                        m('a', {onclick: function() {
                            return false;
                        }}, 
                            'Te'),

                        m('a', {onclick: function() {
                            return false;
                        }}, 
                            'Me'),



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
                            m(TopMenu),
                            m(ThemeSwitcher),
                        ]
                     ),
                m('div', {'id':'lists','class':'lists'},
                    m('pre', {id:'lists2'},
                        Array.from(players).map( x => {
                                return [m('a', {'href':'#', 'class':'list-item', 'style':'color:orange',
                                        'onclick':function(e) {
                                            $(this).css('color', 'red');
                                            m.route.set('/finger');
                                            ficswrap.emit('command', 'finger ' + x[2]);
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
                            '^'),

                        m('a', {onclick: function() {
                            ficswrap.emit('command', 'who');
                            return false;
                        }}, 
                            'All'),

                        m('a', {onclick: function() {
                            ficswrap.emit('command', 'who a');
                            return false;
                        }}, 
                            'Av'),

                        m('a', {onclick: function() {
                            ficswrap.emit('command', 'who R');
                            return false;
                        }}, 
                            'Reg'),

                        m('a', {onclick: function() {
                            ficswrap.emit('command', 'who U');
                            return false;
                        }}, 
                            'Unr'),

                        m('a', {onclick: listsPageDown},
                            'v'),

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
                            m(TopMenu),
                            m(ThemeSwitcher),
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
                                            ficswrap.emit('command', 'observe ' + gamenum);
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
                            ficswrap.emit('command', 'games /bsl');
                            return false;
                        }}, 
                            'ALL'),

                        m('a', {onclick: function() {
                            ficswrap.emit('command', 'games /bl');
                            return false;
                        }}, 
                            'BLZ'),

                        m('a', {onclick: function() {
                            ficswrap.emit('command', 'games /s');
                            return false;
                        }}, 
                            'RPD'),

                        m('a', {onclick: function() {
                            ficswrap.emit('command', 'games /e');
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
    var game = gamemap.get(game_num);
    if (!game) {
        console.log('in runClock and game not found for game_num ' + game_num);
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
    var game = gamemap.get(game_num);
    if (game) {
        clearInterval(game.clocks['w']);
        clearInterval(game.clocks['b']);
        console.log('clock should be stopping for gamenum ' + game_num);
    } else {
        console.log('in stopClocks and game not found for game_num ' + game_num);
    }
}














var Board = {
    //gamemap: new Map(),
    game_num: '',
    board: null,
    createChessboard: function() {
        var game = gamemap.get(Board.game_num);
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
                            ficswrap.emit('command', valid_move.from + '-' + valid_move.to);
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

        console.log('in goToMove, game_num is');
        console.log(Board.game_num);
        var game = gamemap.get(Board.game_num);
        game.current_move_index = i;
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
                console.log(game);
                console.log(Board.board);
                Board.board.position(game.fens[i], animate);
            }

            var mv = game.chess.history({verbose: true})[i];

            highlightSquares($('#board'), 'yellow', move=mv);

        }
    },

    applyTheme: function() {
        var game = gamemap.get(Board.game_num);
        if ( game.human_color === 'b' ) {
            Board.board.flip();
            game.top_is_black = false;
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
        console.log('IN BOARD ONCREATE');
        console.log('game_num is '+Board.game_num);
        Board.createChessboard();
        Board.applyTheme();
        //Board.goToMove(Board.game_num, -2);
        runClock(Board.game_num);
    },
    oninit: function(vnode) {
        console.log('IN BOARD ONINIT');
        console.log('game_num is '+Board.game_num);
        Board.game_num = vnode.attrs.game_num;
        console.log('game_num is '+Board.game_num);
    },
    onupdate: function(vnode) {
        console.log('IN BOARD ONUPDATE');
        console.log('game_num is '+Board.game_num);
        if ( Board.game_num != vnode.attrs.game_num ) {
            Board.game_num = vnode.attrs.game_num;
            Board.createChessboard();
            Board.applyTheme();
            //Board.goToMove(Board.game_num, -2);
            runClock(Board.game_num);
        }
    },
    view: function(vnode) {
        var game = gamemap.get(Board.game_num);
        return [gamemap.get(Board.game_num)].map( game => {

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
                            m('div', {'id':'result_'+Board.game_num,'class':'centerbold'},
                                /*
						        game.situ || game.result
                                ?
                                */
                                game.situ + ' ' + game.result
                                /*
                                :
                                'IN PROGRESS'
                                */
                            )
					),
				]
        });
    }
}
    
var BoardController = {
    cur_game_num: '',

    oncreate: function(vnode) {
        console.log('IN BOARDCPONTROLLER ONCREATE');
        console.log('cur_game_num is '+BoardController.cur_game_num);
        calcDims();
    },
    oninit: function(vnode) {
        if ( vnode.attrs.cur_game_num ) {
            BoardController.cur_game_num = vnode.attrs.cur_game_num;
        }
        console.log('IN BOARDCONTROLLER ONINIT');
        console.log('cur_game_num is '+BoardController.cur_game_num);
    },
    onupdate: function(vnode) {
        if ( BoardController.cur_game_num != vnode.attrs.cur_game_num ) {
            BoardController.cur_game_num = vnode.attrs.cur_game_num;
        }
        console.log('IN BOARDCONTOLRRER ONUPDATE');
        console.log('cur_game_num is '+BoardController.cur_game_num);
    },
    view: function(vnode) {
        var game = gamemap.get(BoardController.cur_game_num);
        return m("div", {"id":"page"},
				[
                    m('div', {'id': 'top_nav', 'class': 'evenly_spaced nav_container'},
                        [
                            m(TopMenu),
                            m(GameSwitcher),
                            m(ThemeSwitcher),
                        ]
                    ),
	
                    m(Board, {game_num: BoardController.cur_game_num}),

                    m('div', {'id': 'bottom_nav', 'class': 'evenly_spaced nav_container'},
                        [
                            m('a', {"class":"dropdown"}, 
									'M',
									m("div", {"class":"dropdown_content dropup"},
										[
											m("a", {}, 
												"abort"
											),
											m("a", {}, 
												"remove"
											),
											m("a", {}, 
												"share/export"
											),
											m("a", {}, 
												"get game"
											),
											m("a", {}, 
												"seek"
											),
											m("a", {}, 
												"rematch"
											),
											m("a", {}, 
												"draw"
											),
											m("a", {}, 
												"resign"
											),
										]
									)
								),

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

                            //m('a', {onmousedown: BoardController.rewind, onmouseup: () => clearInterval(BoardController.rwtimer)},
                            m('a', {onmousedown: BoardController.rewind, onclick: BoardController.moveBack},
                                '<<'),

                            //m('a', {onmousedown: BoardController.fastforward, onmouseup: () => clearInterval(BoardController.fftimer)},
                            m('a', {onmousedown: BoardController.fastforward, onclick: BoardController.moveForward},
                                '>>'),

                        ]
                     ),


				]
			)
    },
    moveBack: function() {
        var game = gamemap.get(BoardController.cur_game_num);
        if (game.current_move_index > -1) {
            Board.goToMove(game.game_num, game.current_move_index - 1);
        }
        return false;
    },
    moveForward: function() {
        var game = gamemap.get(BoardController.cur_game_num);
        if (game.current_move_index < game.chess.history().length - 1) {
            Board.goToMove(game.game_num, game.current_move_index + 1);
        }
        return false;
    },
    rewind: function() {
        var game = gamemap.get(BoardController.cur_game_num);
        if (game.current_move_index > -1) {
            BoardController.rwtimer = setInterval( function() {
                                    if (game.current_move_index > -1) {
                                        Board.goToMove(game.game_num, game.current_move_index - 1);
                                    }
                                    m.redraw();
            }, 75);
        }
        return false;




    },
    fastforward: function() {
        var game = gamemap.get(BoardController.cur_game_num);
        if (game.current_move_index < game.chess.history().length - 1) {
            BoardController.fftimer = setInterval( function() {
                                    if (game.current_move_index < game.chess.history().length - 1) {
                                        Board.goToMove(game.game_num, game.current_move_index + 1);
                                    }
                                    m.redraw();
            }, 75);
        }
        return false;
    },
}


m.route.set('/login');

m.route(root, "/login", {
    "/lobby": Lobby,
    "/gamelist": GameList,
    "/login": Login,
    "/board_controller": BoardController,
    "/playerlist": PlayerList,
    "/finger": Finger,
})

var human_game = null;


var default_themes = [
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


var soundmap = {
    ambience: [],
    gong: [],
    moves: [],
    captures: [],
    checks: []
};

var themes;
var playername = '';
var players = [];

function loadThemes() {
    themes = Cookies.get('themes');
    if (!themes) {
        themes = default_themes;
        Cookies.set('themes', JSON.stringify(themes), {expires: 30000});
    } else {
        themes = JSON.parse(themes);
    }
}


function highlightSquares(board_div, color, move=null, clear=false) {
    board_div.find('.square-55d63').removeClass('highlight-square-'+color);
    if (move && !clear) {
        board_div.find('.square-' + move.to).addClass('highlight-square-'+color);
        board_div.find('.square-' + move.from).addClass('highlight-square-'+color);
    }
}


ficswrap.on("logged_in", function(msg) {
    Login.mid_attempt = false;

    loadThemes();

    m.request({
        method: 'GET',
        url: '/soundmap'
    })
    .then( (result) => {
        for (i=0; i<result.ambience.length; i++) {
            soundmap.ambience.push( new Howl({ src: ['/sound/ambience/' + result.ambience[i]] }) );
        }
        for (i=0; i<result.gong.length; i++) {
            soundmap.gong.push( new Howl({ src: ['/sound/gong/' + result.gong[i]] }) );
        }
        for (i=0; i<result.moves.length; i++) {
            soundmap.moves.push( new Howl({ src: ['/sound/moves/' + result.moves[i]] }) );
        }
        for (i=0; i<result.captures.length; i++) {
            soundmap.captures.push( new Howl({ src: ['/sound/captures/' + result.captures[i]] }) );
        }
        for (i=0; i<result.checks.length; i++) {
            soundmap.checks.push( new Howl({ src: ['/sound/checks/' + result.checks[i]] }) );
        }
    })
    .catch( (err) => console.log('EROROROR: ' + err) );

    ficswrap.emit('command', 'variables');

    m.route.set('/lobby');
});



ficswrap.on("result", function(msg) {
    console.log(msg);
    var ficsobj = window.FICSPARSER.parse(msg);
    console.log(ficsobj);

    var showout = false;
    if ( (ficsobj.cmd_num === 0 || ficsobj.cmd_num === 773450001) && /^123987001/.test(ficsobj.fullbody) === false) {
        showout = true;
    }

    if (ficsobj.cmd_code) {
        cmd_code = ficsobj.cmd_code;
        // games command result
        if (ficsobj.cmd_code === 43) {
            //renderGameList(ficsobj.body.split('\n'));
            GameList.lines = ficsobj.body.split('\n');
            m.redraw()

        // sought command result
        } else if (ficsobj.cmd_code === 157) {
            renderSoughtList(ficsobj.body.split('\n'));

        // variables command result
        } else if (ficsobj.cmd_code === 143) {
            var info = ficsobj.body.split(':')[0].split(/\s+/);
            playername = info[info.length-1];
            m.redraw();
            
            console.log('the players name is');
            console.log(playername);

        // moves command result
        } else if (ficsobj.cmd_code === 77) {
            var movesobj = window.MOVESPARSER.parse(ficsobj.body);
            var game_num = movesobj.get("game_num");
            var game = gamemap.get(game_num);

            if (game) { 
                game.initMoves(movesobj); 
                //BoardController.cur_game_num = game_num;
                m.route.set('/board_controller?cur_game_num='+game_num);
            }
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
			players = [];
			cols.map( col => {
				col.map( it => {
					var re = /[\^~:#. &]/;
					var stat = it.match(re)[0] ;
					var sp = it.split(stat);
					var sp2 = sp[1].split('(');
					var name = sp2[0]
					var extra = sp2[1] ? '('+sp2[1] : ''
					var p = [sp[0], stat, name, extra];
					players.push(p);
				})
			})

            m.route.set('/playerlist');
        }
    }
    
    //showout = true;

    if (ficsobj.unobserve) {
        console.log('remove game nums');
        console.log(ficsobj.remove_game_nums);

        /*
        for (i=0; i<ficsobj.remove_game_nums.length; i++) {
            var grdiv = $('#result_'+ficsobj.remove_game_nums[i]);
            if (grdiv && grdiv.html() === 'IN PROGRESS') {
                grdiv.html('NO LONGER OBSERVING');
            }
            stopClocks(ficsobj.remove_game_nums[i]);
        }
        */
        for (i=0; i<ficsobj.remove_game_nums.length; i++) {
            var game = gamemap.get(ficsobj.remove_game_nums[i]);
            if ( game.situ === 'IN PROGRESS' ) {
                game.situ = 'NO LONGER OBSERVING';
            }
            stopClocks(ficsobj.remove_game_nums[i]);
        }
    }

    if (ficsobj.game_info.result) {
        var game_num = ficsobj.game_info.game_num;
        var game = gamemap.get(game_num);
        game.result = ficsobj.game_info.result;
        game.situ = ficsobj.game_info.situ;
        //if ( !game.situ ) { game.situ = 'IN PROGRESS'; }

        if (['1-0','0-1','1/2-1/2'].indexOf(game.result) != -1) {
            soundmap.gong[Math.floor(Math.random() * soundmap.gong.length)].play();
            stopClocks(game_num);
            console.log('did the clocks stop?');
        }
        m.redraw();
    }

    if (ficsobj.observe) {
        console.log('qwe');
        var game_num = ficsobj.game_info.game_num;
        //if (gamemap.get(game_num)) {    //FIXME
        //    removeGame(game_num);
        //}
        gamemap.set(game_num, new Game(ficsobj.s12, ficsobj.game_info));
        gamemap.get(game_num).theme = themes[Math.floor(Math.random() * themes.length)];
        if (ficsobj.s12.my_rel === '1' || ficsobj.s12.my_rel === '-1') { 
            human_game = gamemap.get(game_num); 
            human_game.human_color =  (ficsobj.s12.whose_move === 'B' && ficsobj.s12.my_rel === '1') || (ficsobj.s12.whose_move === 'W' && ficsobj.s12.my_rel === '-1') ? 'b' : 'w';
        }
        console.log('qwe2');
        ficswrap.emit('command', 'moves ' + game_num);
    } else if (ficsobj.style12) {
        var game_num = ficsobj.s12.game_num;
        var game = gamemap.get(game_num);

        if (game.chess) { 
            if (game.chess.history().length != game.getMoveIndexFromS12() + 1) {
                console.log('chess says '+game.chess.history().length + ' but s12 says ' + game.getMoveIndexFromS12() +', doing nothing');
                //ficswrap.emit('command', 'moves '+game_num);
            } else {
                var move_info = game.chess.move(ficsobj.s12.move_note_short, {sloppy:true});
                if (move_info) {
                    if (game.chess.in_check()) {
                        soundmap.checks[Math.floor(Math.random() * soundmap.checks.length)].play();
                    } else if (['n','b','k','q','p'].includes(move_info.flags)) {
                        soundmap.moves[Math.floor(Math.random() * soundmap.moves.length)].play();
                    } else {
                        soundmap.captures[Math.floor(Math.random() * soundmap.captures.length)].play();
                    }

                    game.s12 = ficsobj.s12;
                    if (['1-0','0-1','1/2-1/2'].indexOf(game.result) === -1) {
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
                    if ( Board.game_num === game.game_num && new_move_index == game.current_move_index + 1) {
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
                        ficswrap.emit('command',valid_move.san);
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
















