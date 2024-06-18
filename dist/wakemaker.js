"use strict";
class Wave {
    pathBlocks;
    ENEMY_SPWAN_X = 25;
    ENEMY_SPAWN_Y = 125;
    ENEMY_RADIUS = 20;
    constructor(pathBlocks) {
        this.pathBlocks = pathBlocks;
    }
    wave1() {
        const enemies = [];
        for (let i = 0; i < 5; i++) {
            enemies.push(new Enemy1(this.ENEMY_SPWAN_X, this.ENEMY_SPAWN_Y, this.ENEMY_RADIUS, "red", this.pathBlocks));
        }
        return [enemies, 500];
    }
}
//# sourceMappingURL=wakemaker.js.map