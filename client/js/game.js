
var gamemap = new Map();

class Game {
    constructor(s12) {
        this.chess = new Chess();
        this.chess.header('White', s12.w_name, 'Black', s12.b_name, 'TimeControl', s12.dur + '+' + s12.inc);

        this.startfen = this.chess.fen().split(' ')[0];

        this.top_is_black = true;
        this.game_num = s12.game_num;

        this.movetimes = [];
        this.fens = [];

        this.s12 = s12;

        this.current_move_index = -1;
        this.clocks = {w:null, b:null};
    }
}


