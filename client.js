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
                console.log('qwenuthead');
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

console.log(window);
$( window ).on('resize',function() {
    calcDims();
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

    $('#top_nav').css('height', nav_height+'px');
    $('#top_nav').css('top', nav_offset+'px');
    
    $('#top_info').css('height', info_height+'px');
    $('#top_info').css('top', info_offset+'px');
    
    $('#top_player').css('height', player_height+'px');
    $('#top_player').css('top', player_offset+'px');
    
    $('#top_space').css('height', space_height+'px');
    $('#top_space').css('top', space_offset+'px');

    $('#board').css('height', board_height+'px');
    $('#board').css('width', board_width+'px');
    $('#board').css('top', board_offset+'px');

    $('#bottom_space').css('height', space_height+'px');
    $('#bottom_space').css('bottom', space_offset+'px');

    $('#bottom_player').css('height', player_height+'px');
    $('#bottom_player').css('bottom', player_offset+'px');
    
    $('#bottom_info').css('height', info_height+'px');
    $('#bottom_info').css('bottom', info_offset+'px');
    
    $('#bottom_nav').css('height', nav_height+'px');
    $('#bottom_nav').css('bottom', nav_offset+'px');
    
    g_board.resize();
}
var g_board;

var TopMenu = {
    view: function(vnode) {
        return m('a', {"class":"dropdown"}, 
				'M',
				m("div", {"class":"dropdown_content"},
					[
						m("a", {}, 
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
							"players"
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
        return [
            m('a', {}, '<'),
            m('a', {}, 'G'),
            m('a', {}, '>'),
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

var GameList = {
    renderGameList : function(lines) {
        if (theme_board) { theme_board.destroy() }
        $('#lists').empty();
        $('<pre id="lists2"></pre>').appendTo($('#lists'));
        lines.forEach(x => {
            if (x.replace(/[\s\n\t\r\x07]*/g,'')) {
                var gamenum = x.replace(/^\s+|\s+$/g, '').split(/\s+/)[0];
                var li = $('<a href="#" class="list-item">'+x+'</a>');
                li.css('color', 'orange');
                li.on({
                    click: function() {
                        li.css('color', 'cyan');
                        ficswrap.emit('command', 'observe ' + gamenum); 
                        return false;
                    }
                }).appendTo('#lists2');
            }
        });
    },
    lines: [],

    oninit: function(vnode) {
        ficswrap.emit('command', 'games');
    },
    view: function(vnode) {
        return m("div", {"id":"page"},
                    m('div', {'id': 'top_nav', 'class': 'evenly_spaced nav_container'},
                        [
                            m(TopMenu),
                            m(ThemeSwitcher),
                        ]
                     ),
                m('div', {'id':'lists'},
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
                )
        );

    }
}

var Boards = {
    oncreate: function(vnode) {
        g_board = Chessboard('board', 'start');
        calcDims();
    },
    oninit: function(vnode) {
    },
    view: function(vnode) {
        return m("div", {"id":"page"},
				[
                    m('div', {'id': 'top_nav', 'class': 'evenly_spaced nav_container'},
                        [
                            m(TopMenu),
                            m(GameSwitcher),
                            m(ThemeSwitcher),
                        ]
                     ),
	

					m("div", {"id":"top_info","class":"info_container"}, 
                            m('div', {'class':'centerbold'},
						        "3 + 0 rated blitz")
					),
					m("div", {"id":"top_player","class":"player_container"}, 
                            m('div', {"class":"player_name"},
						        "plans_list_plans_nhc (1890)",
                                m('div', {'class':'player_time'},
                                    "5:00")
                            )
					),
					m("div", {"id":"top_space","class":"player_space"}),
					m("div", {"class":"board","id":"board"}),
					m("div", {"id":"bottom_space","class":"player_space"}),
					m("div", {"id":"bottom_player","class":"player_container"}, 
                            m('div', {"class":"player_name"},
						        "histEmpBen (2983)",
                                m('div', {'class':'player_time'},
                                    "1:43")
                            )
					),
					m("div", {"id":"bottom_info","class":"info_container"}, 
                            m('div', {'class':'centerbold'},
						        "histEmpBen checkmated 0-1")
					),
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
                            m('a', {}, 'F'),
                            m('a', {}, '<<'),
                            m('a', {}, '>>'),
                        ]
                     ),


				]
			)
    }
}


m.route.set('/login');

m.route(root, "/login", {
    "/lobby": Lobby,
    "/gamelist": GameList,
    "/login": Login,
    "/boards": Boards,
})



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


function loadThemes() {
    var themes = Cookies.get('themes');
    if (!themes) {
        themes = default_themes;
        Cookies.set('themes', JSON.stringify(themes), {expires: 30000});
    }
}

loadThemes();

function highlightSquares(board_div, color, move=null, clear=false) {
    board_div.find('.square-55d63').removeClass('highlight-square-'+color);
    if (move && !clear) {
        board_div.find('.square-' + move.to).addClass('highlight-square-'+color);
        board_div.find('.square-' + move.from).addClass('highlight-square-'+color);
    }
}


ficswrap.on("logged_in", function(msg) {
    $('#login_div').hide();
    $('#shellout').show();
    $('#shellin').show();
    $('#games').prop('hidden', false);
    $('#getgame').prop('hidden', false);
    $('#sought').prop('hidden', false);
    $('#match').prop('hidden', false);
    $('#seek').prop('hidden', false);
    $('#unseek').prop('hidden', false);
    $('#themes').prop('hidden', false);
    $('#resizer').prop('hidden', false);

    Login.mid_attempt = false;

    loadThemes();

    //ficswrap.emit('get','soundmap'); //!!!???

    ficswrap.emit('command', 'variables');
    m.route.set('/lobby');
});

/*
ficswrap.on('login_success', function(msg) {
    console.log('in ficswrap onnnnnnnnn login_success');
    console.log(msg);
    Login.mid_attempt = false;


    m.route.set('/lobby');
});
*/





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
            //console.log(ficsobj.fullbody);

        // moves command result
        } else if (ficsobj.cmd_code === 77) {
            var movesobj = window.MOVESPARSER.parse(ficsobj.body);
            var game_num = movesobj.get("game_num");
            var game = gamemap.get(game_num);

            if (game) { 
                game.initMoves(movesobj); 

                renderGame(game_num);
                renderMoveList(game_num, game.moves);
            }
        }
    }
    
    //showout = true;

    if (ficsobj.unobserve) {
        console.log('remove game nums');
        console.log(ficsobj.remove_game_nums);

        for (i=0; i<ficsobj.remove_game_nums.length; i++) {
            var grdiv = $('#result_'+ficsobj.remove_game_nums[i]);
            if (grdiv && grdiv.html() === 'IN PROGRESS') {
                grdiv.html('NO LONGER OBSERVING');
            }
            stopClocks(ficsobj.remove_game_nums[i]);
        }
    }

    if (ficsobj.game_info.result) {
        var game_num = ficsobj.game_info.game_num;
        var game = gamemap.get(game_num);
        game.result = ficsobj.game_info.result;
        game.situ = ficsobj.game_info.situ;

        if (['1-0','0-1','1/2-1/2'].indexOf(game.result) != -1) {
            soundmap.gong[Math.floor(Math.random() * soundmap.gong.length)].play();
            stopClocks(game_num);
        }
        showResult(game_num);
    }

    if (ficsobj.observe) {
        console.log('qwe');
        var game_num = ficsobj.game_info.game_num;
        if (gamemap.get(game_num)) {
            removeGame(game_num);
        }
        gamemap.set(game_num, new Game(ficsobj.s12, ficsobj.game_info));
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
                    appendToMoveList(game_num, new_move_index);


                    var whose_move = ['w','b'][new_move_index % 2];

                    if (whose_move === game.human_color && !game.premove) { goToMove(game_num, new_move_index, animate=false) }
                    else { goToMove(game_num, new_move_index, animate=true); }
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

                    highlightSquares($('#board_'+game_num), 'red', clear=true);
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
















