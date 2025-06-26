const TILE_SIZE = 16;
const SCALE = 2;
const ZOOM = 1;
const UNIT = TILE_SIZE * SCALE;
const MAP = `
0000F00000010000000000000000000
0001111000010000000000000000000
0000000001111100110000000000000
0000000000000000000000000000000
0000000000000000000000000000000
0000000000000000000011111000000
0000000000000011110000000000000
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
}


let platforms;
let player;
let cursors;
let goal


function create() {

    

    // --------------- Map---------------- //
    platforms = this.physics.add.staticGroup(); 

    const rows = MAP.split('\n');
    const offsetY = config.height - rows.length * UNIT;
    const mapWidth = rows[0].length * UNIT;


    rows.forEach((row, y) => {
        [...row].forEach((tile, x) => {
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
        });
    });
    // --------------- Map ---------------- //





    // --------------- Player --------------- //
    const startX = 2 * UNIT;
    const startY = offsetY - 2 * UNIT;
    
    player = this.physics.add
        .sprite(startX, startY, 'player', 0)
        .setScale(SCALE)
        .setCollideWorldBounds(true)

    this.physics.add.collider(player, platforms);
    this.physics.add.overlap(player, goal, reachGoal, null, this);

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

function reachGoal(){
    this.add.text(player.x - UNIT, player.y - UNIT * 2, 'You reached the goal!', {fontSize: '32px', color: '#fff'});
    this.physics.pause();
    player.setTint(0x00ff88);
}

function update(){
    const speed = 200;
    const jump = 500;


    if(player.y > FALL_LIMIT){
        this.scene.restart();
    }

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

