import Chess from "./chess.js"
const BOARD_WIDTH = 450
const BOARD_HEIGHT = 450
const LINE_NUM = 15
const LINE_SPACE = 30
const CHESS_RADIUS = 15

var canvas = document.getElementById('board')
var regret = document.getElementById('regret')
var restart = document.getElementById('restart')
var turn = document.getElementById('turn')
var step = 1
var chesses = []
Chess.posMap = Array(LINE_NUM-1).fill().map(()=>Array(LINE_NUM-1).fill(0))

let board = {
  width: BOARD_WIDTH,
  height: BOARD_HEIGHT,
  ctx: null,
  canDrawChess: true,
  drawChess: drawChess,
  getMousePos: getMousePos
}

let gobang = {
  board: board,
  drawBoard: drawBoard
}

function drawChess(ctx, chess){
  ctx.beginPath()
  ctx.arc(chess.x,chess.y,CHESS_RADIUS,0,Math.PI*2,true)
  let gradient = ctx.createRadialGradient(chess.x, chess.y, 0, chess.x, chess.y, 10);
  let gradientColor = (chess.color === 'black') ? "#ABB2B9" : "white"
  gradient.addColorStop(0, gradientColor);
  gradient.addColorStop(1, chess.color);
  ctx.fillStyle = gradient
  ctx.fill()
  ctx.closePath()
}

function drawLine(ctx){
  ctx.beginPath()
  for(let i = 1;i<LINE_NUM;i++){
    // draw row
    ctx.moveTo(LINE_SPACE,LINE_SPACE*i)
    ctx.lineTo(board.width-LINE_SPACE,LINE_SPACE*i)
    ctx.stroke()
    // draw column
    ctx.moveTo(LINE_SPACE*i, LINE_SPACE)
    ctx.lineTo(LINE_SPACE*i, board.height-LINE_SPACE)
    ctx.stroke()
  }
  ctx.closePath()
}

function drawBoard(){
  if(canvas.getContext){
    let ctx = canvas.getContext('2d')
    board.ctx = ctx
    ctx.canvas.width = board.width
    ctx.canvas.height = board.height
    drawLine(ctx)
  }else{
    alert('your browser not support the demo')
  }
}

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function markStr(mark){
  let _markStr = `${mark},`.repeat(5).slice(0,-1)
  return _markStr
}

function countX(lastY, mark){
  let rowStr = Chess.posMap[lastY].join(",")
  return rowStr.includes(markStr(mark))
}
function countY(lastX, mark){
  let columnStr = Chess.posMap.map((x)=>x[lastX]).join(",")
  return columnStr.includes(markStr(mark))
}
function countDiagonal(lastX, lastY, mark){
  let count = 1;
  for(let i=1;i<=5;i++){
    try{
      if((Chess.posMap[lastY-i][lastX-i] == mark) ||
         (Chess.posMap[lastY-i][lastX+i] == mark) ||
         (Chess.posMap[lastY+i][lastX-i] == mark) ||
         (Chess.posMap[lastY+i][lastX+i] == mark)){
        count++
      }else{
        count = 1
      }
      if(count>=5){
        return true
      }
    }catch{
      continue
    }
  }
  return false
}

/**
 * posMap has continious 5 same number
 * eg: [2, 2, 2, 2, 2]
 */
function checkWinner(lastX, lastY, mark){
  if(countX(lastY, mark) || countY(lastX, mark) || countDiagonal(lastX, lastY, mark)){
    board.canDrawChess = false;
    let textColor = ((mark === 1) ? 'black' : 'white')
    turn.innerHTML = textColor+' win!'
    turn.style.color = textColor
  }
}

function resetPos(pos){
  pos = Math.round(pos/10)*10
  pos = Math.floor(pos/30)
  pos = (pos == 0) ? pos+1 : (pos == LINE_NUM ? pos-1 : pos)
  pos = pos*30
  return pos
}

gobang.drawBoard();
canvas.onclick = function(e){
  if(!board.canDrawChess){
    return;
  }
  let color = (step % 2 === 0) ? '#D7DBDD' : 'black'
  let pos = board.getMousePos(canvas,e)
  // make chess on the cross
  pos.x = resetPos(pos.x)
  pos.y = resetPos(pos.y)
  let chessPoses = chesses.map((chess)=>chess.pos)
  if(!chessPoses.includes(`x${pos.x}y${pos.y}`)){ // check place be taken
    let promise = new Promise((resolve, reject) => {
      let chess = new Chess(step,pos.x,pos.y,color,`x${pos.x}y${pos.y}`)
      drawChess(board.ctx,chess)
      resolve(chess)
    }).then(chess => {
      step++
      chesses.push(chess)
      let mark = (color === 'black') ? 1 : 2
      let lastX = chess.x/30 -1
      let lastY = chess.y/30 -1
      Chess.posMap[lastY][lastX] = mark
      let textColor = ((color === 'black') ? 'white' : 'black')
      turn.innerHTML = textColor+' turn'
      turn.style.color = textColor
      if(step>=9){
        checkWinner(lastX, lastY, mark)
      }
    })
  }
}
regret.onclick = function(e){
  if(chesses.length){
    let last = chesses.pop()
    Chess.posMap[last.y/30-1][last.x/30-1] = 0
    board.ctx.clearRect(0, 0, canvas.width, canvas.height);
    gobang.drawBoard()
    for(let chess of chesses){
      board.drawChess(board.ctx, chess)
    }
    turn.innerHTML = ((last.color === 'black') ? 'black' : 'white')+' turn'
    let textColor = ((last.color === 'black') ? 'black' : 'white')
    turn.style.color = textColor
    step--
  }
}
restart.onclick = function(){
  location.reload()
}