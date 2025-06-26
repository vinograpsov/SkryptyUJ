const TILE_SIZE = 16;
const SCALE = 2;
const ZOOM = 1;
const UNIT = TILE_SIZE * SCALE;
const MAP = `
000C0FE000001000000000000000000
00011111000C10C00C0000000000000
0000000000111110011000000000000
0000000000000000000000000000000
000000000000000000000EC00000000
0000C0000000000C000111110000000
0000E00000E00011110000000000000
1111110011110000000000000000000
`.trim();




const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 25 * TILE_SIZE * SCALE,
  height: 19 * TILE_SIZE * SCALE,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 1200 }, debug: true },
  },
  scene: {
    preload,
    create,
    update,
  },
};


const FALL_LIMIT = config.height + UNIT * 2; 


new Phaser.Game(config);


function preload() {

    this.load.spritesheet('tiles', 'assets//grotto_escape_pack/graphics/tiles.png',{
    frameWidth: TILE_SIZE,
    frameHeight: TILE_SIZE,
  });

    this.load.spritesheet('player', 'assets/grotto_escape_pack/graphics/player.png', {
    frameWidth: TILE_SIZE,
    frameHeight: TILE_SIZE,
  });

    this.load.spritesheet('crystal', 'assets/grotto_escape_pack/graphics/items.png' , {
    frameWidth: TILE_SIZE,
    frameHeight: TILE_SIZE, 
    });

    this.load.spritesheet('enemy', 'assets/grotto_escape_pack/graphics/enemies.png', {
    frameWidth: TILE_SIZE,
    frameHeight: TILE_SIZE,
  });
}


let platforms;
let player;
let cursors;
let goal
let crystals
let score = 0;
let scoreText;  
let lives = 3;
let livesText;
let invulnerable = false;
let enemies;


function create() {

    this.anims.create({
        key: 'spin',
        frames: this.anims.generateFrameNumbers('crystal', {start: 4, end: 7}),
        frameRate: 10,
        repeat: -1,
    });


    this.anims.create({
        key: 'enemy',
        frames: this.anims.generateFrameNumbers('enemy', {start: 0, end: 2}),
        frameRate: 10,
        repeat: -1,
    });

    // --------------- Map---------------- //
    platforms = this.physics.add.staticGroup(); 
    crystals = this.physics.add.group();
    enemies = this.physics.add.group();


    const rows = MAP.split('\n');
    const offsetY = config.height - rows.length * UNIT;
    const mapWidth = rows[0].length * UNIT;


    rows.forEach((row, y) => {
        [...row].forEach((tile, x) => {
            const worldX = x * UNIT;
            const worldY = offsetY + y * UNIT;
            if (tile === '1') {
                platforms.create(x * UNIT,offsetY +  y * UNIT, 'tiles', 1)
                    .setOrigin(0)
                    .setScale(SCALE)
                    .refreshBody();
            }
            else if (tile === 'F') {
                goal = this.physics.add.staticSprite(
                    x * UNIT, offsetY + y * UNIT, 'tiles', 12)
                    .setOrigin(0)
                    .setScale(SCALE);
                }
                else if (tile === 'C'){
                    const c = crystals.create(x * UNIT, offsetY + y * UNIT, 'crystal')
                        .setScale(SCALE)
                        .setOrigin(0.5);
                    c.body.setAllowGravity(false);
                    c.play('spin');
                }
            else if (tile === 'E') {
                const enemy = enemies.create(worldX, worldY, 'enemy')
                    .setScale(SCALE)
                    .setOrigin(0);
                enemy.body.setCollideWorldBounds(true);
                enemy.body.setVelocityX(50);
                enemy.play('enemy');
            }
        });
    });
    // --------------- Map ---------------- //

    scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '32px',
        fill: '#fff',
    }).setScrollFactor(0);


    livesText = this.add.text(16, 40, 'Lives: ' + lives, {
        fontSize: '32px',
        fill: '#fff',
    }).setScrollFactor(0);
    

    // --------------- Player --------------- //
    const startX = 2 * UNIT;
    const startY = offsetY - 2 * UNIT;
    
    player = this.physics.add
        .sprite(startX, startY, 'player', 0)
        .setScale(SCALE)
        .setCollideWorldBounds(true)

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(enemies, platforms);
    
    this.physics.add.overlap(player, goal, reachGoal, null, this);
    this.physics.add.overlap(player, crystals, collectCrystal, null, this);
    this.physics.add.collider(player, enemies, hitEnemy, null, this);

    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
        frameRate: 10,
        repeat: -1,
    });


    cursors = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.UP,
        left: Phaser.Input.Keyboard.KeyCodes.LEFT,
        right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
        w: Phaser.Input.Keyboard.KeyCodes.W,
        a: Phaser.Input.Keyboard.KeyCodes.A,
        d: Phaser.Input.Keyboard.KeyCodes.D,
    });



    this.physics.world.setBounds(0,0, mapWidth, FALL_LIMIT);
    this.physics.world.setBoundsCollision(true, true, true, false);
    
    this.cameras.main
        .setBounds(0, 0, mapWidth, config.height)
        .setZoom(ZOOM)
        .setBackgroundColor('#1d1d1d')
        .startFollow(player, true, 0.1, 0.1);
    // --------------- Player --------------- //
    
}


function handleDeath() {
    score = 0;
    lives = 3;
    scoreText.setText('Score: ' + score);
    livesText.setText('Lives: ' + lives);
    this.scene.restart();
}

function collectCrystal(player, crystal) {
    crystal.disableBody(true, true);
    score += 1;
    scoreText.setText('Score: ' + score);
}

function hitEnemy(playerObj, enemy) {
  if (playerObj.body.velocity.y > 0) {
    enemy.disableBody(true, true);
    playerObj.setVelocityY(-200);
  } else if (!invulnerable) {
    lives -= 1;
    livesText.setText('Lives: ' + lives);
    if (lives <= 0) {
      handleDeath.call(this);
      return;
    }
    invulnerable = true;
    this.tweens.add({
      targets: playerObj,
      alpha: 0,
      ease: 'Linear',
      duration: 100,
      repeat: 10,
      yoyo: true,
      onComplete: () => { playerObj.alpha = 1; invulnerable = false; }
    });
  }
}



function reachGoal(){
    this.add.text(player.x - UNIT, player.y - UNIT * 2, 'You reached the goal!', {fontSize: '32px', color: '#fff'});
    this.physics.pause();
    player.setTint(0x00ff88);
}

function update(){
    const speed = 200;
    const jump = 500;


    if(player.y > FALL_LIMIT){
        handleDeath.call(this);
    }


    enemies.children.iterate(e => {
      if (e.body.blocked.right) e.setVelocityX(-50);
      else if (e.body.blocked.left) e.setVelocityX(50);
    });

    if(cursors.left.isDown || cursors.a.isDown) {
        player.setVelocityX(-speed);
        player.flipX = true;
        player.anims.play('walk', true);
    }
    else if(cursors.right.isDown || cursors.d.isDown) {
        player.setVelocityX(speed);
        player.flipX = false;
        player.anims.play('walk', true);
    } else {
        player.setVelocityX(0);
        player.anims.stop();
        player.setFrame(0);
    }


    const onGround = player.body.blocked.down;
    if ((cursors.up.isDown || cursors.w.isDown) && onGround) {
        player.setVelocityY(-jump);
    } 

}

