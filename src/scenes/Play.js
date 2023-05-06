class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    preload() {
        // load images/tile sprites
        this.load.image('rocket', './assets/rocket.png');
        this.load.image('spaceship', './assets/spaceship.png');
        this.load.image('starfield', './assets/starfield.png');
        this.load.image('special','./assets/special.png');
        // load spritesheet
        this.load.spritesheet('explosion', './assets/explosion.png', {frameWidth: 64, frameHeight: 32, startFrame: 0, endFrame: 9});

        //load particle
        this.load.atlas('flares','./assets/flares.png','./assets/flares.json');

    }

    create() {
        // place tile sprite
        this.starfield = this.add.tileSprite(0, 0, 640, 480, 'starfield').setOrigin(0, 0);

        // green UI background
        this.add.rectangle(0, borderUISize + borderPadding, game.config.width, borderUISize * 2, 0x00FF00).setOrigin(0, 0);
        // white borders
        this.add.rectangle(0, 0, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0 ,0);
        this.add.rectangle(0, game.config.height - borderUISize, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0 ,0);
        this.add.rectangle(0, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0 ,0);
        this.add.rectangle(game.config.width - borderUISize, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0 ,0);

        // add Rocket (p1)
        this.p1Rocket = new Rocket(this, game.config.width/2, game.config.height - borderUISize - borderPadding, 'rocket').setOrigin(0.5, 0);

        // add Spaceships (x3)
        this.ship01 = new Spaceship(this, game.config.width + borderUISize*6, borderUISize*4, 'spaceship', 0, 30).setOrigin(0, 0);
        this.ship02 = new Spaceship(this, game.config.width + borderUISize*3, borderUISize*5 + borderPadding*2, 'spaceship', 0, 20).setOrigin(0,0);
        this.ship03 = new Spaceship(this, game.config.width, borderUISize*6 + borderPadding*4, 'spaceship', 0, 10).setOrigin(0,0);

        // add New Spaceship Mod
        this.ship04 = new Spaceship(this, game.config.width, borderUISize*4 + borderPadding*3, 'special', 0, 40).setOrigin(0,0);
        this.ship04.moveSpeed = game.settings.spaceshipSpeed * 2;

        // define keys
        keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        
        //sounds
        this.music = this.sound.add('space',{
            volume: 0.5,
            loop: true
        });

        // animation config
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { 
                start: 0, 
                end: 9, 
                first: 0
            }),
            frameRate: 30
        });

        // initialize score
        this.p1Score = 0;

        // Score Config
        this.scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 100
        };
        
        // Text Config
        this.textConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            color: '#843605',
            align: 'left',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 100
        }
        this.scoreLeft = this.add.text(borderUISize + borderPadding, borderUISize + borderPadding * 2, this.p1Score, this.scoreConfig);

        // Display High Score
        this.hsText = this.add.text(borderUISize * 4.6 + borderPadding, borderUISize + borderPadding * 2, "Top:",this.textConfig);
        if (game.settings.mode == "novice") {
            this.highScore = this.add.text(borderUISize * 7.6 + borderPadding, borderUISize + borderPadding * 2, hsNovice, this.scoreConfig);
        } else {
            this.highScore = this.add.text(borderUISize * 7.6 + borderPadding, borderUISize + borderPadding * 2, hsExpert, this.scoreConfig);
        }

        // GAME OVER flag
        this.gameOver = false;

        // 60-second play clock
        this.scoreConfig.fixedWidth = 70;
        this.clock = this.time.delayedCall(game.settings.gameTimer, () => {this.endGame()}, null, this);

        // Display Timer
        this.timeRight = this.add.text((game.config.width - borderUISize * 3 - borderPadding * 2), borderUISize + borderPadding * 2, this.clock.delay / 1000, this.scoreConfig);

        // Speed Round
        this.speedClock = false;
    }

    update() {
        //Updates Clock Timer
        if(!this.gameOver){
            this.timeRight.text = Math.ceil((this.clock.delay - this.clock.elasped) / 1000);
        }
        if (!this.speedClock && this.clock.elasped > 30000) {
            this.ship01.moveSpeed *= 2;
            this.ship02.moveSpeed *= 2;
            this.ship03.moveSpeed *= 2;
        }
        // check key input for restart / menu
        if(this.gameOver && Phaser.Input.Keyboard.JustDown(keyR)) {
            this.scene.restart();
        }

        if(this.gameOver && Phaser.Input.Keyboard.JustDown(keyLEFT)) {
            this.scene.start("menuScene");
        }

        this.starfield.tilePositionX -= 4;  // update tile sprite

        if(!this.gameOver) {
            this.p1Rocket.update();             // update p1
            this.ship01.update();               // update spaceship (x3)
            this.ship02.update();
            this.ship03.update();
            this.ship04.update();
        }

        // check collisions
        if(this.checkCollision(this.p1Rocket, this.ship04)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship04);
        }
        if(this.checkCollision(this.p1Rocket, this.ship03)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship03);
        }
        if (this.checkCollision(this.p1Rocket, this.ship02)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship02);
        }
        if (this.checkCollision(this.p1Rocket, this.ship01)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship01);
        }
    }

    checkCollision(rocket, ship) {
        // simple AABB checking
        if (rocket.x < ship.x + ship.width && 
            rocket.x + rocket.width > ship.x && 
            rocket.y < ship.y + ship.height &&
            rocket.height + rocket.y > ship. y) {
                return true;
        } else {
            return false;
        }
    }

    shipExplode(ship) {
        // temporarily hide ship
        ship.alpha = 0;                         
        // create explosion sprite at ship's position
        let boom = this.add.sprite(ship.x, ship.y, 'explosion').setOrigin(0, 0);
        boom.anims.play('explode');             // play explode animation
        boom.on('animationcomplete', () => {    // callback after anim completes
            ship.reset();                         // reset ship position
            ship.alpha = 1;                       // make ship visible again
            boom.destroy();                       // remove explosion sprite
        });
        //Create Particle explosion
        var particles = this.add.particles('flares');
        particles.emit({
            frame: 'red',
            x: ship.x+20, y: ship.y+10,
            lifespan: { min: 600, max: 800 },
            angle: { start: 0, end: 360, steps: 64 },
            speed: 200,
            quantity: 64, 
            scale: { start: 0.2, end: 0.1 },
            frequency: 32,
            blendMode: 'ADD'
        });

        // score add and repaint
        this.p1Score += ship.points;
        this.clock.delay += 3000;
        this.scoreLeft.text = this.p1Score; 
        
        this.sound.play('sfx_explosion');
        
        // Updates Highscore in both gamemodes
        if (game.settings.mode == "novice") {
            if (this.p1Score > hsNovice) {
                hsNovice = this.p1Score;
                this.highScore.text = hsNovice;

            }
        }else{
            if (game.settings.mode > hsExpert){
                hsExpert = this.p1Score;
                this.highScore.text = hsExpert;
            }
        }
    }
    endGame(){
        this.scoreConfig.fixedWidth = 0;
        this.add.text(game.config.width/2, game.config.height/2, 'GAME OVER', this.scoreConfig).setOrigin(0.5);
        this.add.text(game.config.width/2, game.config.height/2 + 64, 'Press (R) to Restart or ← to Menu', this.scoreConfig).setOrigin(0.5);
        this.gameOver = true;
    }
}

