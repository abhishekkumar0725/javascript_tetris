const canvas = document.getElementById('tetris');
  const canvasContext = canvas.getContext('2d');
    canvasContext.scale(22,22);

const blockColors = ['#7C81E5', '#8DE67C', '#55B9EB', '#E6A97C', '#E2E67D', '#EB7374', '#E67CDE',];

var play = {
  position: {y: 0, x: 5},
  score: 0,
  color: null,
  matrix: null
}

var speedState = false;

const tetrisMatrix = [];
for(var r = 0; r < 22; r++){
  tetrisMatrix.push(new Array(10).fill(0));
}

let timeInterval = 0;
let lastIteration = 0;
let moveTime = 1000;

var gameOver = false;
  var pauseGame = false;

function pieceReset(){
  var pieceNum = Math.floor(Math.random()*7);
    play.matrix = choosePiece(pieceNum);
    play.color = blockColors[pieceNum];
  play.position.x = tetrisMatrix[0].length / 2 - (play.matrix[0].length / 2 | 0);
    play.position.y = 0;

  if (collision()) {
      gameOver = true;
  }

  printScore();
}

function pause(){
  if(pauseGame){
    pauseGame = false;
  }
  else{
    pauseGame = true;
  }
}

function lineSweep(){
  const lineCount = 1;
  lines: for(var y =  tetrisMatrix.length-1; y > 0; y--){
    for(var x = 0; x < tetrisMatrix[0].length; x++){
      if(tetrisMatrix[y][x] == 0){
        continue lines;
      }
    }
    const row = tetrisMatrix.splice(y, 1)[0].fill(0);
    tetrisMatrix.unshift(row);
    y++;
    play.score += lineCount * 10;
  }
}

function choosePiece(inNum){
  if (inNum == 0) {
    return [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
    ];
  }
  else if (inNum == 1) {
    return [
        [0, 2, 0],
        [0, 2, 0],
        [0, 2, 2],
    ];
  }
  else if (inNum == 2) {
    return [
        [0, 3, 0],
        [0, 3, 0],
        [3, 3, 0],
    ];
  }
  else if (inNum == 3) {
    return [
        [4, 4],
        [4, 4],
    ];
  }
  else if (inNum == 4) {
    return [
        [5, 5, 0],
        [0, 5, 5],
        [0, 0, 0],
    ];
  }
  else if (inNum == 5) {
    return [
        [0, 6, 6],
        [6, 6, 0],
        [0, 0, 0],
    ];
  }
  else if (inNum == 6) {
    return [
        [0, 7, 0],
        [7, 7, 7],
        [0, 0, 0],
    ];
  }
}

function softDrop(){
  play.position.y++;
  if(collision()){
    play.position.y--;
    copyPlay();
      pieceReset();
      lineSweep();
      printScore();
  }
  timeInterval = 0;

}

function hardDrop(){
  const initPlace = play.position.y;
  while(!collision()){
    play.position.y++;
  }
  if(collision()){
    play.position.y--;
    copyPlay();
      play.score += Math.floor(.25 * (play.position.y-initPlace));
      pieceReset();
      lineSweep();
      printScore();
  }
  timeInterval = 0;
}

function shiftPiece(off){
  play.position.x+=off;
  if(collision()){
    play.position.x-=off;
  }
}

document.addEventListener('keydown', event => {
    if(event.keyCode == 32){
      hardDrop();
    }
    else if (event.keyCode == 37) {
      shiftPiece(-1);
    }
    else if(event.keyCode == 38){
      rotate();
    }
    else if (event.keyCode == 39) {
      shiftPiece(1);
    }
    else if(event.keyCode == 40){
      softDrop();
    }
    else if(event.keyCode == 80){
      pause();
    }
});

function copyPlay(){
  for(var i = 0; i < play.matrix.length; i++){
    for(var j = 0; j <play.matrix[i].length; j++){
      if(play.matrix[i][j] != 0){
        tetrisMatrix[play.position.y + i][play.position.x+ j] = play.matrix[i][j];
      }
    }
  }
}

function collision(){
  const pos = play.position;
  const mat = play.matrix;
  for(var y = 0; y < mat.length; y++){
    for(var x = 0; x < mat[0].length; x++){
      if(mat[y][x] != 0 && (tetrisMatrix[y+pos.y] && tetrisMatrix[y+pos.y][x+pos.x]) != 0){
        return true;
      }
    }
  }
  return false;
}

function fillMatrix(matrix, off){
  for(var i = 0; i < matrix.length; i++){
    var line = matrix[i];
    for(var j = 0; j < line.length; j++){
      if(line[j] != 0){
        canvasContext.fillStyle = play.color;
        canvasContext.fillRect(j+off.x, i+off.y, 1, 1);
      }
    }
  }
}

var tmp;

function rotate(){
  var off = 1;
  const xPosition = play.position.x;
  for (var i=0; i<play.matrix.length/2; i++) {
    for (var j=i; j<play.matrix.length-i-1; j++) {
      tmp=play.matrix[i][j];
      play.matrix[i][j]=play.matrix[play.matrix.length-j-1][i];
        play.matrix[play.matrix.length-j-1][i]=play.matrix[play.matrix.length-i-1][play.matrix.length-j-1];
        play.matrix[play.matrix.length-i-1][play.matrix.length-j-1]=play.matrix[j][play.matrix.length-i-1];
        play.matrix[j][play.matrix.length-i-1]=tmp;
    }
  }
}

function drawMatrix(){
  canvasContext.fillStyle = '#000';
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
  fillMatrix(tetrisMatrix, {x: 0 , y: 0});
    fillMatrix(play.matrix, play.position);
}

function printScore(){
  document.getElementById('score').innerText = "| Score: " + play.score + " |\n";
}

function iterative(time = 0){
  if(!gameOver && !pauseGame){
    const changeTime = time - lastIteration;
      lastIteration = time;
      timeInterval += changeTime;
    if(play.score%100 == 0 && play.score > 99 && (play.score%100 == 0) !=  speedState){
      moveTime -=50;
    }
    if(timeInterval>moveTime){
      softDrop();
    }
    document.getElementById('pauseGame').innerText = "";
    drawMatrix();
      requestAnimationFrame(iterative);
  }
  else if(pauseGame&&!gameOver){
    document.getElementById('pauseGame').innerText = "You paused the game! Click 'p' to unpause!";
    document.addEventListener('keydown', event => {
        if(event.keyCode == 80){
          pauseGame= false;
          iterative();
        }
    });
  }
  else if(gameOver&&!pauseGame){
    for(var y = 0; y < tetrisMatrix.length; y++){
      for(var x = 0; x < tetrisMatrix[0].length; x++){
        tetrisMatrix[y][x] = 0;
      }
    }
    document.getElementById('gameOver').innerText = "Game Over! Your score is " + play.score + "!";
      document.getElementById('score').innerText = "";
  }
  speedState = play.score%100 == 0;
}

function restart(){
  location.reload();
  play.score = 0;
}

pieceReset();
iterative();
