/**
 * Skye Crockett
 * Title: Rocket Patrol: 
 * Time spent: 14hrs
 * 
 * Mod List
 * New Enemy Spaceship (15)
 * High Score (5)
 * Implement Speed Increase (5)
 * Implement time/score (15)
 * Audio Music (5)
 * 
 * 
 * Attemped 
 * Particle Emitter (15) -- Error Code Saying Particle Emitter was Removed(?)
 * Mouse Control (15) -- Only click works
 * Display Time Remaining (10) -- Not Showing
 * 
 */
let config = {
    type: Phaser.CANVAS,
    width: 640,
    height: 480,
    scene: [ Menu, Play ]
}

let game = new Phaser.Game(config);

// set UI sizes
let borderUISize = game.config.height / 15;
let borderPadding = borderUISize / 3;

// reserve keyboard variables
let keyF, keyR, keyLEFT, keyRIGHT, mouse;
//reserve keyboard for 2nd player
let keyA, keyD;

// reserve highscore variable
let hsNovice = 0;
let hsExpert = 0;