/**
    Find the Anomaly Game
    Game Code by: C.J. Jenkins
    Art by: Anodot, Inc.
    References: Phaser.io/examples
**/

var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, 'game-world', { preload: preload, create: create });

var PENGUIN_WIDTH = 32;
var PENGUIN_HEIGHT = 42;
var BOARD_COLS;
var BOARD_ROWS;
var ANOMALY_X_POS;
var ANOMALY_Y_POS;
var ANOMALY;
var FAILEDCLICKS = 0;
var FAILEDCLICKSMAX = 10;

var sprites;
var selectedSprite = null;
var selectedSpriteStartPos;
var allowInput;

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

function preload() {

    game.load.spritesheet("NORMAL", "assets/sprites/32x42-penguin-normal.png", PENGUIN_WIDTH, PENGUIN_HEIGHT);
    game.load.spritesheet("ANOMALY", "assets/sprites/32x42-penguin-anomaly.png", PENGUIN_WIDTH, PENGUIN_HEIGHT);
    game.load.spritesheet("ANOMALYCHEAT", "assets/sprites/32x42-penguin-anomaly-red.png", PENGUIN_WIDTH, PENGUIN_HEIGHT);

}

function create() {
    game.stage.backgroundColor = "#b8dbd7";

    // Populate sprites
    spawnBoard();

    // Reveal anomaly if player clicks wrong sprite too many times
    game.input.onDown.add(cheat, this);
}

// Reveal anomaly if player clicks wrong sprite too many times
function cheat(){
    FAILEDCLICKS++;

    if (FAILEDCLICKS > FAILEDCLICKSMAX){
        ANOMALY.alpha = 0;
        ANOMALY.loadTexture('ANOMALYCHEAT');

        game.add.tween(ANOMALY).to( { alpha: 1 }, 1000, Phaser.Easing.Linear.None, true, 0, 1000, true);

        FAILEDCLICKS = 0;
    }
}

// Reload game after post-game click
function playAgain(){
    game.state.restart();
}

// Highlight anomaly and display win condition text
function foundAnomaly(){

    // Make sprite flash
    FAILEDCLICKS = FAILEDCLICKSMAX;
    cheat();

    // Darken game to display text
    var bar = game.add.graphics();
    bar.beginFill(0x000000, 0.5);
    bar.drawRect(0, 0, window.innerWidth, window.innerHeight);

    bar.inputEnabled = true;
    bar.events.onInputDown.add(playAgain, this);

    // Write win condition text
    var style = { font: "bold 50px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };

    text = game.add.text(0, 0, "YOU FOUND IT!", style);
    text.setShadow(3, 3, 'rgba(0,0,0,1)', 2);

    text.setTextBounds(0, 0, window.innerWidth, window.innerHeight);

    style = { font: "bold 30px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };

    text = game.add.text(0, 40, "Click to play again.", style);
    text.setShadow(3, 3, 'rgba(0,0,0,1)', 2);

    text.setTextBounds(0, 0, window.innerWidth, window.innerHeight);

    style = { font: "bold 20px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };

    text = game.add.text(0, 70, "Hint: Click aimlessly to cheat.", style);
    text.setShadow(3, 3, 'rgba(0,0,0,1)', 2);

    text.setTextBounds(0, 0, window.innerWidth, window.innerHeight);
}

// Populate sprites
function spawnBoard() {
    BOARD_COLS = Math.floor(game.world.width / PENGUIN_WIDTH);
    BOARD_ROWS = Math.floor(game.world.height / PENGUIN_HEIGHT);
    ANOMALY_X_POS = getRandomInteger(0, BOARD_COLS-1);
    ANOMALY_Y_POS = getRandomInteger(0, BOARD_ROWS-1);

    sprites = game.add.group();

    for (var i = 0; i < BOARD_COLS; i = i + 2)
    {
        for (var j = 0; j < BOARD_ROWS; j++)
        {
            if (i == ANOMALY_X_POS && j == ANOMALY_Y_POS) {
                ANOMALY = sprites.create(i * PENGUIN_WIDTH, j * PENGUIN_HEIGHT, "ANOMALY");
                ANOMALY.inputEnabled = true;
                ANOMALY.events.onInputDown.add(foundAnomaly, this);
                ANOMALY.name = 'anomaly';
                setSpritePos(ANOMALY, i, j);
            }
            else {
                var gameSprite = sprites.create(i * PENGUIN_WIDTH, j * PENGUIN_HEIGHT, "NORMAL");
                gameSprite.name = 'sprite' + i.toString() + 'x' + j.toString();
                setSpritePos(gameSprite, i, j);
            }
        }
    }

    for (var i = 1; i < BOARD_COLS; i = i + 2)
    {
        for (var j = 0; j < BOARD_ROWS-1; j++)
        {
            if (i == ANOMALY_X_POS && j == ANOMALY_Y_POS) {
                ANOMALY = sprites.create(i * PENGUIN_WIDTH, (j * PENGUIN_HEIGHT)+20, "ANOMALY");
                ANOMALY.inputEnabled = true;
                ANOMALY.events.onInputDown.add(foundAnomaly, this);
                ANOMALY.name = 'anomaly';
                setSpritePos(ANOMALY, i, j);
            }
            else {
                var gameSprite = sprites.create(i * PENGUIN_WIDTH, (j * PENGUIN_HEIGHT)+20, "NORMAL");
                gameSprite.name = 'sprite' + i.toString() + 'x' + j.toString();
                setSpritePos(gameSprite, i, j);
            }
        }
    }
}

// Select a sprite and remember its starting position
function selectSprite(gameSprite) {

    if (allowInput)
    {
        selectedSprite = gameSprite;
        selectedSpriteStartPos.x = gameSprite.posX;
        selectedSpriteStartPos.y = gameSprite.posY;
    }

}

// Set the position on the board for a sprite
function setSpritePos(gameSprite, posX, posY) {

    gameSprite.posX = posX;
    gameSprite.posY = posY;
    gameSprite.id = calcSpriteId(posX, posY);

}

// The sprite id is used by getSprite() to find specific sprites in the group
// each position on the board has a unique id
function calcSpriteId(posX, posY) {

    return posX + posY * BOARD_COLS;

}

// Find a sprite on the board according to its position on the board
function getSprite(posX, posY) {

    return sprites.iterate("id", calcSpriteId(posX, posY), Phaser.Group.RETURN_CHILD);

}
