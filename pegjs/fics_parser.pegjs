/*
{ end_reached: false,
  cmd_num: 0,
  cmd_code: 0,
  body: '\n\n',
  style12: '<12> r----rk- --p--pp- -p-p---p p-nP--q- ----Pb-- Q-NB---- PPP----- -K-R--R- B -1 0 0 0 0 3 11 TISL GuestNRTJ 0 5 0 30 32 164 214 23 R/h1-g1 (0:07) Rhg1 0 1 0',
  s12: 
   { ranks: 
      [ 'r----rk-',
        '--p--pp-',
        '-p-p---p',
        'p-nP--q-',
        '----Pb--',
        'Q-NB----',
        'PPP-----',
        '-K-R--R-' ],
     whose_move: 'B',
     epfile: '-1',
     w_kcast: '0',
     w_qcast: '0',
     b_kcast: '0',
     b_qcast: '0',
     moves_since_ir: '3',
     game_num: '11',
     w_name: 'TISL',
     b_name: 'GuestNRTJ',
     my_rel: '0',
     dur: '5',
     inc: '0',
     w_mat: '30',
     b_mat: '32',
     w_clock: '164',
     b_clock: '214',
     move_num: '23',
     move_note: 'R/h1-g1',
     move_time: '(0:07)',
     move_note_short: 'Rhg1',
     board_flip: '0' } }
     */

///////////////////////////
{
    var res = {
        end_reached: false,
        cmd_num: 0,
        cmd_code: 0,
        body: '',
        style12: '',
        s12: { ranks:[] }
        };
}

start =  header? body ender? {
  return res;
  }

header = $("\x15" cmdnum "\x16" cmdcode "\x16")

body = neither? style12? neither?

ender = "\x17" {
  res.end_reached=true; }

cmdnum = cnum: $([0-9]+) {
 res.cmd_num = parseInt(cnum); }

cmdcode = ccode: $([0-9]+) {
 res.cmd_code = parseInt(ccode); }


neither = bod: $( (!(style12 / "\x17") .)* )  {  
  res.body = res.body + bod; }


_ = " "+

s12_rank = x: $([\-PpRrNnBbQqKk][\-PpRrNnBbQqKk][\-PpRrNnBbQqKk][\-PpRrNnBbQqKk]
            [\-PpRrNnBbQqKk][\-PpRrNnBbQqKk][\-PpRrNnBbQqKk][\-PpRrNnBbQqKk])  { if (res.s12.ranks.length < 8) res.s12.ranks.push(x); }

s12_whose_move = x: [BW]  { res.s12.whose_move = x; }
s12_epfile = x: $([\-0-7]+)  { res.s12.epfile = parseInt(x); }

s12_w_kcast = x: [01]  { res.s12.w_kcast = parseInt(x); }
s12_w_qcast = x: [01]  { res.s12.w_qcast = parseInt(x); }
s12_b_kcast = x: [01]  { res.s12.b_kcast = parseInt(x); }
s12_b_qcast = x: [01]  { res.s12.b_qcast = parseInt(x); }

s12_moves_since_ir = x: $([0-9]+)  { res.s12.moves_since_ir = parseInt(x); }

s12_game_num = x: $([0-9]+)  { res.s12.game_num = parseInt(x); }

s12_w_name = x: $( [^ ]+ )  { res.s12.w_name = x; }
s12_b_name = x: $( [^ ]+ )  { res.s12.b_name = x; }

s12_my_rel = x: $([\-0-7]+)  { res.s12.my_rel = parseInt(x); }

s12_dur = x: $([0-9]+)  { res.s12.dur = parseInt(x); }
s12_inc = x: $([0-9]+)  { res.s12.inc = parseInt(x); }

s12_w_mat = x: $([0-9]+)  { res.s12.w_mat = parseInt(x); }
s12_b_mat = x: $([0-9]+)  { res.s12.b_mat = parseInt(x); }

s12_w_clock = x: $([0-9]+)  { res.s12.w_clock = parseInt(x); }
s12_b_clock = x: $([0-9]+)  { res.s12.b_clock = parseInt(x); }

s12_move_num = x: $([0-9]+)  { res.s12.move_num = parseInt(x); }

s12_move_note = x: $( [^ ]+ )  { let movs = x.split('/'); res.s12.move_piece = movs[0]; res.s12.move_note = movs[1]; }
s12_move_time = x: $( [^ ]+ )  { res.s12.move_time = x; }
s12_move_note_short = x: $( [^ ]+ )  { res.s12.move_note_short = x; }

s12_board_flip = x: [01]  { res.s12.board_flip = parseInt(x); }

style12 = x: $("<12>" _ s12_rank _ s12_rank _ s12_rank _ s12_rank 
                 _ s12_rank _ s12_rank _ s12_rank _ s12_rank 
                 _ s12_whose_move _ s12_epfile 
                 _ s12_w_kcast _ s12_w_qcast _ s12_b_kcast _ s12_b_qcast 
                 _ s12_moves_since_ir _ s12_game_num 
                 _ s12_w_name _ s12_b_name 
                 _ s12_my_rel 
                 _ s12_dur _ s12_inc _ s12_w_mat _ s12_b_mat 
                 _ s12_w_clock _ s12_b_clock _ s12_move_num 
                 _ s12_move_note _ s12_move_time _ s12_move_note_short 
                 _ s12_board_flip
                 (!"\n" .)*)  { res.style12 = x }

